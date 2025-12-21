# n8n Templates Store

A premium marketplace for high-quality, production-ready n8n automation workflows. Built with modern web technologies, this platform offers a seamless experience for browsing, purchasing, and downloading automation templates.

## 🚀 Features

- **Premium & Free Templates**: Curated library of verified n8n workflows.
- **Secure Payments**: Integrated with Cashfree for secure transactions.
- **Instant Digital Delivery**: Automated secure download links upon purchase.
- **User Dashboard**: Manage orders, downloads, and profile settings.
- **Admin Panel**: Comprehensive management for products, orders, coupons, and users.
- **SEO Optimized**: Built for visibility with dynamic metadata and structured data.
- **Responsive Design**: Flawless experience across Mobile, Tablet, and Desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Directory)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Auth**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Payments**: [Cashfree](https://www.cashfree.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🏗️ Architecture

The project follows a modular, feature-based architecture within the Next.js App Router:

```bash
├── app/
│   ├── (auth)/          # Authentication routes (login, signup, verify)
│   ├── admin/           # Protected admin dashboard
│   ├── api/             # Secure API routes (payments, downloads)
│   └── templates/       # detailed product pages
├── components/
│   ├── ui/              # Reusable UI primitives (shadcn/ui compatible)
│   └── [feature]/       # Feature-specific components
├── lib/
│   ├── firebase/        # Server & Client Firebase configs
│   └── utils.ts         # Shared helpers
└── contexts/            # Global state (AuthContext)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project
- Cashfree Merchant Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/n8n-templates-store.git
   cd n8n-templates-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Firebase Client (Public)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Secret)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

   # Payments (Cashfree)
   CASHFREE_APP_ID=your_app_id
   CASHFREE_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CASHFREE_MODE=sandbox # or production

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🚀 Deployment Config

### Firebase Auth Domain (Critical)
After deploying, if you see `auth/unauthorized-domain` error during login:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** > **Settings** > **Authorized Domains**
3. Click "Add Domain"
4. Add your deployed domain (e.g., `your-app.vercel.app`)

## 🔒 Security

- **Authentication**: Secured via Firebase Auth with email verification gates.
- **Authorization**: Role-based access control (RBAC) for Admin routes.
- **Data Safety**: Firestore security rules ensure data isolation.
- **Payment Integrity**: Signature verification for all payment callbacks.
- **Download Tokens**: One-time, time-limited tokens for file downloads.

## 📱 Responsiveness

The UI is built mobile-first using Tailwind CSS breakpoints:
- `sm`: 640px (Mobile Landscape)
- `md`: 768px (Tablets)
- `lg`: 1024px (Laptops)
- `xl`: 1280px (Desktops)

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
