import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    // Basic validation
    if (
      !firstName ||
      typeof firstName !== "string" ||
      !firstName.trim()
    ) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 },
      );
    }

    if (
      !lastName ||
      typeof lastName !== "string" ||
      !lastName.trim()
    ) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 },
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 },
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json(
      { id: submission.id, message: "Thank you for your message!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to submit contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit your message" },
      { status: 500 },
    );
  }
}
