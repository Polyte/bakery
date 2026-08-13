import { hashSync } from "bcryptjs"
import {
  OrderStatus,
  PaymentRecordStatus,
  PaymentStatus,
  PrismaClient,
  QuoteStatus,
  UserRole,
} from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Dadda's Confectionery…")

  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.loyaltyPointTransaction.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.contactEnquiry.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.page.deleteMany()
  await prisma.couponUsage.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.newsletterTemplate.deleteMany()
  await prisma.newsletterCampaign.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.delivery.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.deliveryZone.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.recipeItem.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.inventoryTransaction.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.incomeTransaction.deleteMany()
  await prisma.refund.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.quoteItem.deleteMany()
  await prisma.orderNote.deleteMany()
  await prisma.orderStatusHistory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.customCakeRequest.deleteMany()
  await prisma.productOption.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.customerTagAssignment.deleteMany()
  await prisma.customerTag.deleteMany()
  await prisma.customerAddress.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.seoMetadata.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.webhookEvent.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = hashSync("admin123!", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@daddasconfectionery.co.za",
      passwordHash,
      firstName: "Dadda",
      lastName: "Admin",
      phone: "+27 12 000 0000",
      role: UserRole.SUPER_ADMIN,
    },
  })

  await prisma.user.createMany({
    data: [
      {
        email: "manager@daddasconfectionery.co.za",
        passwordHash,
        firstName: "Thandi",
        lastName: "Manager",
        role: UserRole.MANAGER,
      },
      {
        email: "production@daddasconfectionery.co.za",
        passwordHash,
        firstName: "Sipho",
        lastName: "Baker",
        role: UserRole.PRODUCTION,
      },
      {
        email: "finance@daddasconfectionery.co.za",
        passwordHash,
        firstName: "Lerato",
        lastName: "Finance",
        role: UserRole.FINANCE,
      },
    ],
  })

  const tags = await Promise.all(
    ["Wedding", "Birthday", "Corporate", "VIP", "Returning", "New", "Wholesale", "High value"].map(
      (name) => prisma.customerTag.create({ data: { name } }),
    ),
  )

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: "Nomsa",
        lastName: "Dlamini",
        email: "nomsa@example.com",
        phone: "+27 82 111 1111",
        whatsapp: "+27 82 111 1111",
        marketingConsent: true,
        preferredContact: "whatsapp",
        addresses: {
          create: {
            label: "Home",
            line1: "12 Jacaranda Ave",
            city: "Pretoria",
            province: "Gauteng",
            postalCode: "0182",
            isDefault: true,
          },
        },
        tagAssignments: { create: [{ tagId: tags[0].id }, { tagId: tags[4].id }] },
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "James",
        lastName: "van der Berg",
        email: "james@example.com",
        phone: "+27 83 222 2222",
        company: "VD Berg Consulting",
        marketingConsent: true,
        addresses: {
          create: {
            label: "Office",
            line1: "88 Church Street",
            city: "Pretoria",
            province: "Gauteng",
            postalCode: "0002",
            isDefault: true,
          },
        },
        tagAssignments: { create: [{ tagId: tags[2].id }, { tagId: tags[3].id }] },
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Aisha",
        lastName: "Patel",
        email: "aisha@example.com",
        phone: "+27 84 333 3333",
        birthday: new Date("1992-08-20"),
        marketingConsent: true,
        tagAssignments: { create: [{ tagId: tags[1].id }, { tagId: tags[5].id }] },
      },
    }),
  ])

  // Fix CustomerAddress - I accidentally used city: undefined on Customer. Customer model doesn't have city - addresses do. Let me check schema... Customer doesn't have city field. Good - I used invalid `city: undefined as never` which might cause issues. Looking at my create - I have `city: undefined as never` which Prisma might reject. Let me fix the seed - remove that.

  const wedding = await prisma.productCategory.create({
    data: {
      name: "Wedding Cakes",
      slug: "wedding",
      description: "Tiered cakes for the big day",
      sortOrder: 1,
    },
  })
  const birthday = await prisma.productCategory.create({
    data: {
      name: "Birthday Cakes",
      slug: "birthday",
      description: "Celebration cakes",
      sortOrder: 2,
    },
  })
  const cupcakes = await prisma.productCategory.create({
    data: {
      name: "Cupcakes",
      slug: "cupcakes",
      description: "Boxed cupcakes",
      sortOrder: 3,
    },
  })
  const treats = await prisma.productCategory.create({
    data: {
      name: "Treats",
      slug: "treats",
      description: "Everyday bakery treats",
      sortOrder: 4,
    },
  })

  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: "WED-TIER-01",
        name: "Classic Three-Tier Wedding Cake",
        slug: "classic-three-tier-wedding",
        description: "Elegant fondant finish with fresh florals.",
        shortDescription: "Three-tier wedding centrepiece",
        categoryId: wedding.id,
        productType: "wedding",
        price: 4500,
        costPrice: 1800,
        image: "/shop/signature-cake.jpg",
        isFeatured: true,
        isBestseller: true,
        sizeLabel: "3 tiers",
        serves: "Serves 60–80",
        flavor: "Vanilla bean & berry",
        stockStatus: "made_to_order",
        leadTimeDays: 14,
        preparationHours: 72,
      },
    }),
    prisma.product.create({
      data: {
        sku: "BDAY-15-01",
        name: "15cm Fondant Birthday Cake",
        slug: "15cm-fondant-birthday",
        description: "Our signature 15cm fondant celebration cake.",
        shortDescription: "Fondant birthday cake",
        categoryId: birthday.id,
        productType: "birthday",
        price: 1050,
        costPrice: 420,
        image: "/shop/signature-cake.jpg",
        isFeatured: true,
        sizeLabel: "15cm fondant",
        serves: "Serves 8–12",
        flavor: "Classic Vanilla Bean",
        stockStatus: "made_to_order",
        leadTimeDays: 3,
      },
    }),
    prisma.product.create({
      data: {
        sku: "CUP-BOX-12",
        name: "Dozen Signature Cupcakes",
        slug: "dozen-signature-cupcakes",
        description: "Assorted box of twelve cupcakes.",
        categoryId: cupcakes.id,
        productType: "cupcakes",
        price: 420,
        costPrice: 160,
        image: "/shop/signature-cake.jpg",
        isNew: true,
        sizeLabel: "12 cupcakes",
        serves: "12",
      },
    }),
    prisma.product.create({
      data: {
        sku: "TRT-SCONE-6",
        name: "Fresh Cream Scones (6)",
        slug: "fresh-cream-scones-6",
        categoryId: treats.id,
        productType: "pastries",
        price: 180,
        costPrice: 60,
        image: "/shop/signature-cake.jpg",
        shortDescription: "Warm scones with cream",
      },
    }),
  ])

  const supplier = await prisma.supplier.create({
    data: {
      name: "Pretoria Baking Supplies",
      contactPerson: "Pieter Botha",
      email: "orders@pbs.example.com",
      phone: "+27 12 555 0100",
      paymentTerms: "Net 30",
    },
  })

  const flour = await prisma.inventoryItem.create({
    data: {
      name: "Cake Flour",
      sku: "ING-FLOUR",
      unit: "kg",
      quantity: 45,
      minStock: 10,
      costPerUnit: 28,
      supplierId: supplier.id,
    },
  })
  await prisma.inventoryItem.createMany({
    data: [
      { name: "Caster Sugar", sku: "ING-SUGAR", unit: "kg", quantity: 30, minStock: 8, costPerUnit: 22, supplierId: supplier.id },
      { name: "Unsalted Butter", sku: "ING-BUTTER", unit: "kg", quantity: 12, minStock: 5, costPerUnit: 95, supplierId: supplier.id },
      { name: "Eggs", sku: "ING-EGGS", unit: "each", quantity: 180, minStock: 60, costPerUnit: 3.5, supplierId: supplier.id },
      { name: "Belgian Cocoa", sku: "ING-COCOA", unit: "kg", quantity: 4, minStock: 2, costPerUnit: 210, supplierId: supplier.id },
      { name: "White Fondant", sku: "ING-FONDANT", unit: "kg", quantity: 8, minStock: 3, costPerUnit: 85, supplierId: supplier.id },
    ],
  })

  await prisma.recipe.create({
    data: {
      productId: products[1].id,
      name: "15cm Vanilla Fondant Cake",
      yieldQty: 1,
      items: {
        create: [
          { inventoryItemId: flour.id, quantity: 0.5, unit: "kg" },
        ],
      },
    },
  })

  const today = new Date()
  const in3 = new Date(today)
  in3.setDate(today.getDate() + 3)
  const in7 = new Date(today)
  in7.setDate(today.getDate() + 7)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "DAD-2026-000001",
      customerId: customers[0].id,
      status: OrderStatus.PAYMENT_VERIFICATION,
      paymentStatus: PaymentStatus.VERIFICATION_REQUIRED,
      fulfillment: "pickup",
      customerFirstName: customers[0].firstName,
      customerLastName: customers[0].lastName,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      requiredDate: in3,
      requiredTime: "10:00 AM - 12:00 PM",
      subtotal: 1050,
      deliveryFee: 0,
      total: 1050,
      depositRequired: 525,
      amountPaid: 525,
      paymentMethod: "eft",
      paymentReference: "DAD-2026-000001",
      customerNotes: "Please add gold leaf accents",
      items: {
        create: [
          {
            productId: products[1].id,
            name: products[1].name,
            sku: products[1].sku,
            image: products[1].image,
            quantity: 1,
            unitPrice: 1050,
            totalPrice: 1050,
            customisation: JSON.stringify({
              size: "15cm fondant",
              flavour: "Classic Vanilla Bean",
              filling: "Fresh Strawberry Compote",
              message: "Happy Anniversary Nomsa",
            }),
            kind: "cake",
          },
        ],
      },
      statusHistory: {
        create: [
          { toStatus: OrderStatus.NEW, note: "Order placed online" },
          { fromStatus: "NEW", toStatus: OrderStatus.AWAITING_DEPOSIT, note: "Deposit requested" },
          {
            fromStatus: "AWAITING_DEPOSIT",
            toStatus: OrderStatus.PAYMENT_VERIFICATION,
            note: "Customer uploaded EFT proof",
          },
        ],
      },
    },
  })

  await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-000001",
      customerId: customers[0].id,
      orderId: order1.id,
      amount: 525,
      method: "eft",
      status: PaymentRecordStatus.VERIFICATION_REQUIRED,
      reference: "DAD-2026-000001",
      notes: "Awaiting bank confirmation",
      paidAt: yesterday,
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: "DAD-2026-000002",
      customerId: customers[1].id,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      fulfillment: "delivery",
      customerFirstName: customers[1].firstName,
      customerLastName: customers[1].lastName,
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      requiredDate: in7,
      requiredTime: "14:00 - 16:00",
      deliveryAddress: "88 Church Street, Pretoria",
      deliveryFee: 85,
      subtotal: 4500,
      total: 4585,
      depositRequired: 2292.5,
      amountPaid: 4585,
      paymentMethod: "yoco",
      confirmedAt: yesterday,
      items: {
        create: [
          {
            productId: products[0].id,
            name: products[0].name,
            sku: products[0].sku,
            image: products[0].image,
            quantity: 1,
            unitPrice: 4500,
            totalPrice: 4500,
            customisation: JSON.stringify({ tiers: 3, theme: "Ivory & blush roses" }),
            kind: "cake",
          },
        ],
      },
      statusHistory: {
        create: [
          { toStatus: OrderStatus.NEW },
          { fromStatus: "NEW", toStatus: OrderStatus.CONFIRMED, note: "Paid in full via Yoco" },
        ],
      },
      delivery: {
        create: {
          status: "scheduled",
          address: "88 Church Street, Pretoria",
          fee: 85,
          scheduledDate: in7,
          scheduledWindow: "14:00 - 16:00",
        },
      },
    },
  })

  await prisma.order.create({
    data: {
      orderNumber: "DAD-2026-000003",
      customerId: customers[2].id,
      status: OrderStatus.IN_PRODUCTION,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      fulfillment: "pickup",
      customerFirstName: customers[2].firstName,
      customerLastName: customers[2].lastName,
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      requiredDate: today,
      requiredTime: "10:00 AM - 12:00 PM",
      subtotal: 420,
      total: 420,
      depositRequired: 210,
      amountPaid: 210,
      paymentMethod: "eft",
      items: {
        create: [
          {
            productId: products[2].id,
            name: products[2].name,
            quantity: 1,
            unitPrice: 420,
            totalPrice: 420,
            kind: "product",
          },
        ],
      },
      statusHistory: {
        create: [
          { toStatus: OrderStatus.NEW },
          { fromStatus: "NEW", toStatus: OrderStatus.CONFIRMED },
          { fromStatus: "CONFIRMED", toStatus: OrderStatus.IN_PRODUCTION },
        ],
      },
    },
  })

  await prisma.quote.create({
    data: {
      quoteNumber: "QT-2026-000001",
      customerId: customers[0].id,
      status: QuoteStatus.SENT,
      subtotal: 6200,
      deliveryFee: 120,
      labourCharge: 400,
      total: 6720,
      depositRequired: 3360,
      expiryDate: in7,
      terms: "50% deposit to confirm. Balance due 3 days before collection.",
      sentAt: yesterday,
      items: {
        create: [
          {
            productId: products[0].id,
            name: "Four-tier wedding cake with fresh florals",
            description: "Custom height, ivory fondant, blush roses",
            quantity: 1,
            unitPrice: 6200,
            totalPrice: 6200,
          },
        ],
      },
    },
  })

  await prisma.customCakeRequest.create({
    data: {
      requestNumber: "CCR-2026-000001",
      customerId: customers[2].id,
      status: "new",
      occasion: "Birthday",
      eventDate: in7,
      guests: 25,
      cakeSize: "20cm",
      flavour: "Chocolate",
      filling: "Salted caramel",
      theme: "Garden party",
      colours: "Sage & cream",
      budget: 1800,
      designDescription: "Semi-naked finish with edible flowers",
      customerName: "Aisha Patel",
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
    },
  })

  await prisma.expense.createMany({
    data: [
      { category: "ingredients", description: "Weekly flour & sugar", amount: 1850, date: yesterday },
      { category: "packaging", description: "Cake boxes", amount: 640, date: yesterday },
      { category: "utilities", description: "Electricity", amount: 2200, date: today },
      { category: "marketing", description: "Instagram boost", amount: 350, date: today },
    ],
  })

  await prisma.incomeTransaction.createMany({
    data: [
      { category: "deposit", description: "Deposit DAD-2026-000001", amount: 525, date: yesterday, orderId: order1.id },
      { category: "product_sales", description: "Yoco payment DAD-2026-000002", amount: 4585, date: yesterday },
    ],
  })

  await prisma.heroSlide.createMany({
    data: [
      {
        heading: "Baked with Love",
        subheading: "Custom cakes from our Pretoria kitchen",
        ctaText: "Start Your Order",
        ctaUrl: "/order",
        desktopImage: "/shop/signature-cake.jpg",
        mobileImage: "/shop/signature-cake.jpg",
        sortOrder: 1,
        isActive: true,
      },
      {
        heading: "Wedding Cakes",
        subheading: "Tiered centrepieces for your celebration",
        ctaText: "View Wedding Cakes",
        ctaUrl: "/cakes/wedding",
        desktopImage: "/videos/cakes-wedding-tier.jpg",
        sortOrder: 2,
        isActive: true,
      },
    ],
  })

  await prisma.galleryImage.createMany({
    data: [
      { url: "/shop/signature-cake.jpg", caption: "Signature fondant", category: "birthdays", isFeatured: true, sortOrder: 1 },
      { url: "/videos/cakes-wedding-tier.jpg", caption: "Wedding tiers", category: "weddings", isFeatured: true, sortOrder: 2 },
      { url: "/videos/cakes-chocolate-berries.jpg", caption: "Chocolate berries", category: "events", sortOrder: 3 },
    ],
  })

  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "Nomsa D.",
        customerType: "Wedding",
        body: "The cake tasted as beautiful as it looked. Our guests are still talking about it.",
        rating: 5,
        isFeatured: true,
        isPublished: true,
      },
      {
        customerName: "James V.",
        customerType: "Corporate",
        body: "Professional, on time, and the branding on the cupcakes was perfect.",
        rating: 5,
        isFeatured: true,
        isPublished: true,
      },
    ],
  })

  await prisma.faq.createMany({
    data: [
      {
        question: "How far in advance should I order?",
        answer: "Wedding cakes need at least 2 weeks. Birthday and celebration cakes usually need 2–3 days.",
        sortOrder: 1,
      },
      {
        question: "Do you deliver?",
        answer: "Yes, across Gauteng within our delivery radius. Pickup is always available from Amandasig.",
        sortOrder: 2,
      },
    ],
  })

  await prisma.page.createMany({
    data: [
      {
        title: "About",
        slug: "about",
        status: "published",
        content: JSON.stringify({ blocks: [{ type: "paragraph", text: "Dadda's Confectionery — baked with love in Pretoria." }] }),
        seoTitle: "About | Dadda's Confectionery",
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        status: "published",
        content: JSON.stringify({ blocks: [{ type: "paragraph", text: "We respect your privacy." }] }),
      },
    ],
  })

  await prisma.deliveryZone.createMany({
    data: [
      { name: "Pretoria North", fee: 65, minOrder: 0, maxKm: 15, isActive: true },
      { name: "Centurion", fee: 95, minOrder: 500, maxKm: 35, isActive: true },
      { name: "Johannesburg North", fee: 150, minOrder: 800, maxKm: 55, isActive: true },
    ],
  })

  await prisma.promotion.create({
    data: {
      name: "First order welcome",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      maxDiscount: 200,
      isActive: true,
      usageLimit: 100,
    },
  })

  await prisma.promotion.create({
    data: {
      name: "Birthday treat — 10% off",
      code: "BIRTHDAY10",
      type: "percentage",
      value: 10,
      maxDiscount: 500,
      customerSegment: "birthday",
      isActive: true,
      usageLimit: null,
    },
  })

  await prisma.siteSetting.create({
    data: {
      key: "loyalty",
      value: JSON.stringify({
        birthdayDiscountPercent: 10,
        birthdayPromoCode: "BIRTHDAY10",
        pointsPerRand: {
          wedding: 0.15,
          birthday: 0.12,
          anniversary: 0.12,
          children: 0.12,
          corporate: 0.1,
          cupcakes: 0.08,
          popsticles: 0.06,
          scones: 0.05,
          treats: 0.05,
        },
        redeemNote: "Points can be redeemed later for discounts and specials.",
      }),
    },
  })

  await prisma.contactEnquiry.create({
    data: {
      name: "Sarah Molefe",
      email: "sarah@example.com",
      phone: "+27 81 444 4444",
      subject: "Wedding tasting",
      message: "We would love to book a tasting for September.",
      enquiryType: "wedding",
      status: "new",
    },
  })

  await prisma.siteSetting.createMany({
    data: [
      {
        key: "business",
        value: JSON.stringify({
          name: "Dadda's Confectionery",
          description: "Baked with Love",
          phone: "+27 12 000 0000",
          email: "info@daddasconfectionery.co.za",
          address: "6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, Pretoria",
          currency: "ZAR",
          currencySymbol: "R",
          defaultDepositPercent: 50,
          minimumOrderValue: 0,
        }),
      },
      {
        key: "banking",
        value: JSON.stringify({
          bankName: "Capitec",
          accountHolder: "MISS MMABATHO SHAKOANE",
          accountNumber: "1398614864",
          accountType: "Main Account",
          branchCode: "470010",
          swift: "CABLZAJJ",
          payshap: "0726775070",
          referenceFormat: "DAD-YYYY-######",
          paymentInstructions: "Use your order number as payment reference. PayShap to Standard Bank: 0726775070.",
        }),
      },
      {
        key: "checkout",
        value: JSON.stringify({
          pickupEnabled: true,
          deliveryEnabled: true,
          yocoEnabled: true,
          eftEnabled: true,
          cashOnCollection: true,
        }),
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Payment awaiting verification",
        body: "DAD-2026-000001 — R525 EFT proof uploaded",
        type: "urgent",
        href: "/admin/orders/DAD-2026-000001",
      },
      {
        userId: admin.id,
        title: "Order due today",
        body: "DAD-2026-000003 cupcakes for Aisha Patel",
        type: "today",
        href: "/admin/orders/DAD-2026-000003",
      },
    ],
  })

  // Update customer aggregates
  await prisma.customer.update({
    where: { id: customers[0].id },
    data: { orderCount: 1, lifetimeSpend: 525 },
  })
  await prisma.customer.update({
    where: { id: customers[1].id },
    data: { orderCount: 1, lifetimeSpend: 4585 },
  })
  await prisma.customer.update({
    where: { id: customers[2].id },
    data: { orderCount: 1, lifetimeSpend: 210 },
  })

  console.log("Seed complete.")
  console.log("Admin login: admin@daddasconfectionery.co.za / admin123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
