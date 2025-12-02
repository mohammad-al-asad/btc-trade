"use client";
import moment from "moment";
import { Prisma } from "@/app/generated/prisma/client";
import { RiDeleteBin7Fill } from "react-icons/ri";
export const OpenOrdersList = ({
  data,
}: {
  data: (Prisma.FutureTradeModel & { growth: number })[];
}) => {
  const handleCancelOrder = async (tradeId: string) => {
    const res = await fetch(`/api/trade/future/end/${tradeId}`, {
      method: "PUT",
    });
  };
  return (
    <div>
      <div className="max-w-full overflow-x-auto w-full scroll-hide">
        <table className=" w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Date
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Entry
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Cost
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Leverage
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Growth
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Profit
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Loss
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Side
              </th>
              <th className="text-start text-sm font-semibold text-main ">
                Cancel
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((trade) => (
              <tr
                className="text-sm  border-b border-b-[rgb(53,59,70)] hover:bg-[#434a57] transition-colors cursor-default"
                key={trade.id}
              >
                <td className="text-start text-sm text-white py-3">
                  {moment(trade.createAt).format("lll")}
                </td>
                <td className="text-start text-sm text-white">
                  ₿{(trade.leverage * +trade.margin) / +trade.entryUSDT}
                </td>
                <td className="text-start text-sm text-white">
                  ${Number(trade.margin).toFixed(2)}
                </td>
                <td className="text-start text-sm text-white">
                  {trade.leverage}X
                </td>
                <td
                  className={`text-start text-sm ${
                    trade.growth > 0
                      ? "text-[#2ebd85]"
                      : trade.growth == 0
                      ? "text-white"
                      : "text-red"
                  }`}
                >
                  {trade.growth.toFixed(2)}%
                </td>
                <td className="text-start text-sm text-white">
                  ${Number(trade.profit).toFixed(2)}
                </td>
                <td className="text-start text-sm text-white">
                  ${Number(trade.loss).toFixed(2)}
                </td>
                <td
                  className={`text-start text-sm capitalize  ${
                    trade.trade == "LONG" ? "text-[#2ebd85]" : "text-red"
                  }`}
                >
                  {trade.trade.toLowerCase()}
                </td>
                <td className="text-start text-sm text-white">
                  <button
                    className="cursor-pointer"
                    onClick={() => handleCancelOrder(trade.id)}
                  >
                    <RiDeleteBin7Fill className="text-[#5d626a] w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ClosedOrdersList = ({
  data,
}: {
  data: Prisma.FutureTradeModel[];
}) => {
  const handleCancelOrder = (tradeId: string) => {
    alert(tradeId);
  };
  return (
    <div>
      <div className="max-w-full overflow-x-auto w-full scroll-hide">
        <table className=" w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Date
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Entry
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Cost
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Leverage
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Profit
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Loss
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Side
              </th>
              <th className="text-start text-sm font-medium text-[#4f5867]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((trade) => (
              <tr
                className="text-sm  border-b border-b-[rgb(53,59,70)] hover:bg-[#434a57] transition-colors cursor-default"
                key={trade.id}
              >
                <td className="text-start text-sm text-white py-3">
                  {moment(trade.createAt).format("lll")}
                </td>
                <td className="text-start text-sm text-white">
                  ₿{(trade.leverage * +trade.margin) / +trade.entryUSDT}
                </td>
                <td className="text-start text-sm text-white">
                  ${(Number(trade.margin)*(+trade.entryUSDT)).toFixed(2)}
                </td>
                <td className="text-start text-sm text-white">
                  {trade.leverage}X
                </td>
                <td className="text-start text-sm text-white">
                  ${(Number(trade.profit)*(+trade.entryUSDT)).toFixed(2)}
                </td>
                <td className="text-start text-sm text-white">
                 ${(Number(trade.loss)*(+trade.entryUSDT)).toFixed(2)}
                </td>
                <td
                  className={`text-start text-sm capitalize  ${
                    trade.trade == "LONG" ? "text-[#2ebd85]" : "text-red"
                  }`}
                >
                  {trade.trade.toLowerCase()}
                </td>
                <td
                  className={`text-start text-sm ${
                    trade.status == "ENDED" ? "text-main" : "text-orange-400"
                  } capitalize`}
                >
                  {trade.status.toLowerCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
