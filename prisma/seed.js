const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.user.deleteMany({});

  const users = [
    {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      password: "password123",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Mira Patel",
      email: "mira@example.com",
      password: "password123",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Noah Kim",
      email: "noah@example.com",
      password: "password123",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        image: userData.image,
        hashedPassword,
      },
      create: {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        hashedPassword,
      },
    });
  }

  const createdUsers = await prisma.user.findMany({
    where: {
      email: {
        in: users.map((user) => user.email),
      },
    },
    select: { id: true, email: true },
  });

  const listings = [
    {
      title: "Luxury Lakeside Villa",
      description: "A serene villa with panoramic lake views and a private dock.",
      imageSrc: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      category: "Beach",
      roomCount: 4,
      bathroomCount: 3,
      guestCount: 6,
      locationValue: "Bengaluru-India",
      price: 220,
    },
    {
      title: "Mountain Cabin Retreat",
      description: "Cozy retreat with a fireplace, hot tub, and forest views.",
      category: "Mountain",
      imageSrc: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      roomCount: 3,
      bathroomCount: 2,
      guestCount: 4,
      locationValue: "Shimla-India",
      price: 180,
    },
    {
      title: "Modern City Loft",
      description: "Stylish loft in the heart of the city with skyline views.",
      category: "City",
      imageSrc: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      roomCount: 2,
      bathroomCount: 2,
      guestCount: 3,
      locationValue: "New York-US",
      price: 140,
    },
    {
      title: "Desert Oasis Escape",
      description: "Minimalist desert home with a private pool and outdoor lounge.",
      category: "Desert",
      imageSrc: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      roomCount: 3,
      bathroomCount: 2,
      guestCount: 5,
      locationValue: "Dubai-United Arab Emirates",
      price: 190,
    },
    {
      title: "Forest Treehouse",
      description: "An elevated stay surrounded by trees and nature trails.",
      category: "Treehouse",
      imageSrc: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80",
      roomCount: 2,
      bathroomCount: 1,
      guestCount: 2,
      locationValue: "Manali-India",
      price: 120,
    },
    {
      title: "Island Beach House",
      description: "Bright beach house with ocean views and direct access to the shore.",
      category: "Beach",
      imageSrc: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      roomCount: 4,
      bathroomCount: 3,
      guestCount: 6,
      locationValue: "Goa-India",
      price: 260,
    },
  ];

  for (let index = 0; index < listings.length; index += 1) {
    const listing = listings[index];
    const user = createdUsers[index % createdUsers.length];

    await prisma.listing.create({
      data: {
        ...listing,
        userId: user.id,
      },
    });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
