import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couple_names, wedding_date, location, story } = await req.json();

    if (!couple_names?.trim() || !story?.trim()) {
      return NextResponse.json(
        { error: "Couple names and story are required" },
        { status: 400 }
      );
    }

    // Use service_role client to bypass admin-only RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from("testimonials").insert({
      couple_names: couple_names.trim(),
      wedding_date: wedding_date || null,
      location: location?.trim() || null,
      story: story.trim(),
      is_visible: false, // pending admin approval
      submitted_by: user.id,
    });

    if (error) {
      console.error("Testimonial insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
