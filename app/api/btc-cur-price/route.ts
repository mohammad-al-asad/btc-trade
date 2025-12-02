import { NextRequest, NextResponse } from "next/server";
import Binance from "node-binance-api";

export const GET = async (req: NextRequest) => {
  try {
    const binance = new Binance();
    const ticker = await binance.prices("BTCUSDT");
    return NextResponse.json({
      price: ticker.BTCUSDT,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
