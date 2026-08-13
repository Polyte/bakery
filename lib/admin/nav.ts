import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Factory,
  Truck,
  Megaphone,
  Globe,
  Wallet,
  BarChart3,
  Settings,
  MessageSquare,
} from "lucide-react"

export type NavItem = {
  title: string
  href?: string
  icon: LucideIcon
  children?: { title: string; href: string }[]
}

export const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    children: [
      { title: "All Orders", href: "/admin/orders" },
      { title: "Orders Board", href: "/admin/orders/board" },
      { title: "New Orders", href: "/admin/orders?status=NEW" },
      { title: "Custom Cake Requests", href: "/admin/orders/custom-requests" },
      { title: "Quotes", href: "/admin/quotes" },
      { title: "Invoices", href: "/admin/invoices" },
      { title: "Payments", href: "/admin/payments" },
    ],
  },
  {
    title: "Products",
    icon: Package,
    children: [
      { title: "All Products", href: "/admin/products" },
      { title: "Categories", href: "/admin/products/categories" },
      { title: "New Product", href: "/admin/products/new" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    children: [
      { title: "Customers", href: "/admin/customers" },
      { title: "New Customer", href: "/admin/customers/new" },
      { title: "Birthday offers", href: "/admin/customers/birthdays" },
    ],
  },
  {
    title: "Production",
    icon: Factory,
    children: [
      { title: "Production Board", href: "/admin/production" },
      { title: "Calendar", href: "/admin/calendar" },
      { title: "Inventory", href: "/admin/inventory" },
    ],
  },
  {
    title: "Delivery",
    icon: Truck,
    children: [{ title: "Deliveries", href: "/admin/deliveries" }],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [{ title: "Promotions", href: "/admin/marketing/promotions" }],
  },
  {
    title: "Website",
    icon: Globe,
    children: [
      { title: "Hero Carousel", href: "/admin/website/hero" },
      { title: "Gallery", href: "/admin/website/gallery" },
      { title: "Testimonials", href: "/admin/website/testimonials" },
      { title: "FAQs", href: "/admin/website/faqs" },
    ],
  },
  {
    title: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
  },
  {
    title: "Finance",
    icon: Wallet,
    children: [
      { title: "Income", href: "/admin/finance/income" },
      { title: "Expenses", href: "/admin/finance/expenses" },
      { title: "Banking Details", href: "/admin/finance/banking" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [{ title: "Sales Analytics", href: "/admin/analytics" }],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Business Settings", href: "/admin/settings" },
      { title: "Users & Roles", href: "/admin/settings/users" },
      { title: "Audit Logs", href: "/admin/settings/audit" },
    ],
  },
]
