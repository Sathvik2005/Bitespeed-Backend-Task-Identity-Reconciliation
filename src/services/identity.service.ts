import prisma from '../lib/prisma';
import { Contact, IdentifyRequest, IdentifyResponse } from '../types';

export class IdentityService {
  /**
   * Main method to identify and reconcile customer identity
   */
  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    // Convert phoneNumber to string if it's a number
    const normalizedPhoneNumber = phoneNumber?.toString() || null;

    // Find all contacts matching email or phoneNumber
    const matchingContacts = await this.findMatchingContacts(
      email || null,
      normalizedPhoneNumber
    );

    // Case A: No existing contacts - create new primary
    if (matchingContacts.length === 0) {
      const newContact = await this.createPrimaryContact(
        email || null,
        normalizedPhoneNumber
      );
      return this.buildResponse([newContact]);
    }

    // Get all linked contacts (including primary and all secondaries)
    const allLinkedContacts = await this.getAllLinkedContacts(matchingContacts);

    // Check if we need to create a new secondary contact
    const needsNewSecondary = this.shouldCreateSecondaryContact(
      allLinkedContacts,
      email || null,
      normalizedPhoneNumber
    );

    // Find all primary contacts in the linked group
    const primaryContacts = allLinkedContacts.filter(
      (c) => c.linkPrecedence === 'primary'
    );

    // Case C: Multiple primaries exist - need to merge
    if (primaryContacts.length > 1) {
      await this.mergePrimaryContacts(primaryContacts);
      // Refresh linked contacts after merge
      const refreshedContacts = await this.getAllLinkedContacts(matchingContacts);
      
      if (needsNewSecondary) {
        const oldestPrimary = this.getOldestPrimary(refreshedContacts);
        const newSecondary = await this.createSecondaryContact(
          email || null,
          normalizedPhoneNumber,
          oldestPrimary.id
        );
        refreshedContacts.push(newSecondary);
      }
      
      return this.buildResponse(refreshedContacts);
    }

    // Case B: Single primary exists
    if (needsNewSecondary) {
      const oldestPrimary = this.getOldestPrimary(allLinkedContacts);
      const newSecondary = await this.createSecondaryContact(
        email || null,
        normalizedPhoneNumber,
        oldestPrimary.id
      );
      allLinkedContacts.push(newSecondary);
    }

    return this.buildResponse(allLinkedContacts);
  }

  /**
   * Find contacts matching email or phoneNumber
   */
  private async findMatchingContacts(
    email: string | null,
    phoneNumber: string | null
  ): Promise<Contact[]> {
    const conditions = [];

    if (email) {
      conditions.push({ email });
    }

    if (phoneNumber) {
      conditions.push({ phoneNumber });
    }

    if (conditions.length === 0) {
      return [];
    }

    return await prisma.contact.findMany({
      where: {
        OR: conditions,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get all contacts in a linked group
   */
  private async getAllLinkedContacts(contacts: Contact[]): Promise<Contact[]> {
    if (contacts.length === 0) {
      return [];
    }

    // Get all primary IDs (either the contact itself if primary, or its linkedId)
    const primaryIds = new Set<number>();
    
    contacts.forEach((contact) => {
      if (contact.linkPrecedence === 'primary') {
        primaryIds.add(contact.id);
      } else if (contact.linkedId) {
        primaryIds.add(contact.linkedId);
      }
    });

    // If no primary found, something went wrong
    if (primaryIds.size === 0) {
      return contacts;
    }

    // Get all contacts linked to these primaries
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: { in: Array.from(primaryIds) } },
          { linkedId: { in: Array.from(primaryIds) } },
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return allLinkedContacts;
  }

  /**
   * Merge multiple primary contacts into one
   * The oldest primary remains primary, others become secondary
   */
  private async mergePrimaryContacts(primaries: Contact[]): Promise<void> {
    // Sort by createdAt to find the oldest
    const sortedPrimaries = [...primaries].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const oldestPrimary = sortedPrimaries[0];
    const primariesToConvert = sortedPrimaries.slice(1);

    // Convert other primaries to secondary
    for (const primary of primariesToConvert) {
      await prisma.contact.update({
        where: { id: primary.id },
        data: {
          linkedId: oldestPrimary.id,
          linkPrecedence: 'secondary',
          updatedAt: new Date(),
        },
      });

      // Update all contacts that were linked to this primary
      await prisma.contact.updateMany({
        where: {
          linkedId: primary.id,
          deletedAt: null,
        },
        data: {
          linkedId: oldestPrimary.id,
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * Check if a new secondary contact should be created
   */
  private shouldCreateSecondaryContact(
    existingContacts: Contact[],
    email: string | null,
    phoneNumber: string | null
  ): boolean {
    // Check if exact match already exists
    const exactMatch = existingContacts.find(
      (contact) =>
        contact.email === email && contact.phoneNumber === phoneNumber
    );

    if (exactMatch) {
      return false;
    }

    // Check if we have new information
    const hasNewEmail =
      email &&
      !existingContacts.some((contact) => contact.email === email);

    const hasNewPhoneNumber =
      phoneNumber &&
      !existingContacts.some((contact) => contact.phoneNumber === phoneNumber);

    // Create secondary if we have both email and phone, and at least one is new
    if (email && phoneNumber && (hasNewEmail || hasNewPhoneNumber)) {
      return true;
    }

    return false;
  }

  /**
   * Create a new primary contact
   */
  private async createPrimaryContact(
    email: string | null,
    phoneNumber: string | null
  ): Promise<Contact> {
    return await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: null,
        linkPrecedence: 'primary',
      },
    });
  }

  /**
   * Create a new secondary contact
   */
  private async createSecondaryContact(
    email: string | null,
    phoneNumber: string | null,
    linkedId: number
  ): Promise<Contact> {
    return await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId,
        linkPrecedence: 'secondary',
      },
    });
  }

  /**
   * Get the oldest primary contact from a list
   */
  private getOldestPrimary(contacts: Contact[]): Contact {
    const primaries = contacts.filter((c) => c.linkPrecedence === 'primary');
    
    if (primaries.length === 0) {
      throw new Error('No primary contact found');
    }

    return primaries.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0];
  }

  /**
   * Build the response in the required format
   */
  private buildResponse(contacts: Contact[]): IdentifyResponse {
    if (contacts.length === 0) {
      throw new Error('No contacts to build response from');
    }

    // Find the primary contact
    const primary = contacts.find((c) => c.linkPrecedence === 'primary');

    if (!primary) {
      throw new Error('No primary contact found in the group');
    }

    // Get all secondary contacts
    const secondaries = contacts.filter((c) => c.linkPrecedence === 'secondary');

    // Collect unique emails (primary first)
    const emails: string[] = [];
    if (primary.email) {
      emails.push(primary.email);
    }
    
    secondaries.forEach((contact) => {
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
    });

    // Collect unique phone numbers (primary first)
    const phoneNumbers: string[] = [];
    if (primary.phoneNumber) {
      phoneNumbers.push(primary.phoneNumber);
    }
    
    secondaries.forEach((contact) => {
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    });

    // Get secondary contact IDs in order of creation
    const secondaryContactIds = secondaries
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((c) => c.id);

    return {
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}

export default new IdentityService();
