import { NextResponse } from "next/server";
import { findRegion } from "@/lib/regions";
import { getForecast } from "@/lib/fetchForecast";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ region: string }> }
) {
  const { region } = await params;

  if (!findRegion(region)) {
    return NextResponse.json(
      { error: `Neznano gorsko območje: '${region}'` },
      { status: 400 }
    );
  }

  try {
    const data = await getForecast(region);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neznana napaka";
    return NextResponse.json(
      { error: `Napaka pri pridobivanju/razčlenjevanju ARSO napovedi: ${message}` },
      { status: 502 }
    );
  }
}
