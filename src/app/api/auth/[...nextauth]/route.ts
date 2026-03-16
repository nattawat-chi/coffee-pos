// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. ค้นหา User จาก Email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // 2. ตรวจสอบรหัสผ่านว่าตรงกันไหม (เทียบค่าที่พิมพ์มา กับค่าที่เข้ารหัสไว้ใน DB)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) return null;

        // 3. ถ้าผ่าน ส่งข้อมูลกลับไปสร้าง Session
        return {
          id: user.id,
          email: user.email,
          role: user.role, // ส่งสิทธิ์การใช้งาน (Admin/Staff) ไปเก็บไว้ใน Session ด้วย
        };
      },
    }),
  ],
  callbacks: {
    // แนบ Role เข้าไปใน Token และ Session จะได้เอาไปเช็คที่หน้าเว็บได้
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // กำหนดให้วิ่งไปหน้า /login เวลาที่ยังไม่ได้เข้าระบบ
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
