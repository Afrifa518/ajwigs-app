import { NextResponse } from "next/server";
import { isApiError } from "@/lib/api-error";
import { assertAdminOrThrow, getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

type DbOrderItem = {
  id: string;
  product_id: string | null;
  name: string;
  price_pence: number;
  quantity: number;
  color: string | null;
  size: string | null;
  image_url: string | null;
};

type DbOrder = {
  id: string;
  user_id: string;
  amount_pence: number;
  status: string;
  payment_method: string;
  payment: boolean;
  address: unknown;
  created_at: string;
  order_items: DbOrderItem[];
};

export async function POST() {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,user_id,amount_pence,status,payment_method,payment,address,created_at,order_items(id,product_id,name,price_pence,quantity,color,size,image_url)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const orders = ((data ?? []) as DbOrder[]).map((o) => ({
      _id: o.id,
      userId: o.user_id,
      items: (o.order_items ?? []).map((i) => ({
        ...(i.size
          ? { color: i.color ?? "", size: i.size ?? "" }
          : { color: "", size: i.color ?? "" }),
        _id: i.product_id ?? i.id,
        name: i.name,
        price: i.price_pence / 100,
        quantity: i.quantity,
        image: i.image_url ? [i.image_url] : [],
      })),
      amount: o.amount_pence / 100,
      address: o.address,
      status: o.status,
      paymentMethod: o.payment_method,
      payment: o.payment,
      date: new Date(o.created_at).getTime(),
    }));

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    if (isApiError(err)) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status }
      );
    }

    console.error(err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
