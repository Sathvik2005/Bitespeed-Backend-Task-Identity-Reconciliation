import prisma from '../src/lib/prisma';

async function seed() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    await prisma.contact.deleteMany({});
    console.log('Cleared existing contacts');

    // Seed data - FluxKart customer story
    const contact1 = await prisma.contact.create({
      data: {
        email: 'doc@fluxkart.com',
        phoneNumber: '999999',
        linkPrecedence: 'primary',
      },
    });
    console.log('Created contact 1:', contact1);

    const contact2 = await prisma.contact.create({
      data: {
        email: 'mcfly@fluxkart.com',
        phoneNumber: '999999',
        linkedId: contact1.id,
        linkPrecedence: 'secondary',
      },
    });
    console.log('Created contact 2:', contact2);

    const contact3 = await prisma.contact.create({
      data: {
        email: 'george@hillvalley.edu',
        phoneNumber: '919191',
        linkPrecedence: 'primary',
      },
    });
    console.log('Created contact 3:', contact3);

    const contact4 = await prisma.contact.create({
      data: {
        email: 'lorraine@hillvalley.edu',
        phoneNumber: '123456',
        linkedId: contact3.id,
        linkPrecedence: 'secondary',
      },
    });
    console.log('Created contact 4:', contact4);

    const contact5 = await prisma.contact.create({
      data: {
        email: 'biff@hillvalley.edu',
        phoneNumber: '717171',
        linkPrecedence: 'primary',
      },
    });
    console.log('Created contact 5:', contact5);

    const contact6 = await prisma.contact.create({
      data: {
        email: 'marty@fluxkart.com',
        phoneNumber: '555555',
        linkPrecedence: 'primary',
      },
    });
    console.log('Created contact 6:', contact6);

    const contact7 = await prisma.contact.create({
      data: {
        email: 'jennifer@fluxkart.com',
        phoneNumber: '555555',
        linkedId: contact6.id,
        linkPrecedence: 'secondary',
      },
    });
    console.log('Created contact 7:', contact7);

    console.log('Database seeded successfully!');
    console.log('\nSeeded Contacts:');
    console.log('- Doc (Primary): doc@fluxkart.com, 999999');
    console.log('- McFly (Secondary): mcfly@fluxkart.com, 999999');
    console.log('- George (Primary): george@hillvalley.edu, 919191');
    console.log('- Lorraine (Secondary): lorraine@hillvalley.edu, 123456');
    console.log('- Biff (Primary): biff@hillvalley.edu, 717171');
    console.log('- Marty (Primary): marty@fluxkart.com, 555555');
    console.log('- Jennifer (Secondary): jennifer@fluxkart.com, 555555');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
