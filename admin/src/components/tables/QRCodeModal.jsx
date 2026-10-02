import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

const CUSTOMER_APP_URL = "https://restaurent-app-frontend-n5yh-six.vercel.app";

export default function QRCodeModal({
  table,
  onClose,
}) {
  const [copied, setCopied] =
    useState(false);

  if (!table) return null;

  const qrUrl = `${CUSTOMER_APP_URL}/t/${table.qrToken}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(
      qrUrl
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const downloadQR = () => {
    const canvas =
      document.getElementById(
        `qr-${table.id}`
      );

    if (!canvas) return;

    const link =
      document.createElement("a");

    link.download = `table-${table.number}-qr.png`;

    link.href = canvas.toDataURL(
      "image/png"
    );

    link.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
          className="w-full max-w-md rounded-[2rem] bg-[#fffaf5] p-6 shadow-2xl"
        >
          {/* Header */}

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#e86a33]">
                TABLE {table.number}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Table QR Code
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Customers scan this QR code
                to view the menu.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-orange-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* QR */}

          <div className="mt-7 flex justify-center">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <QRCodeCanvas
                id={`qr-${table.id}`}
                value={qrUrl}
                size={220}
                level="H"
                includeMargin
              />
            </div>
          </div>

          {/* URL */}

          <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-3">
            <p className="break-all text-center text-xs text-gray-500">
              {qrUrl}
            </p>
          </div>

          {/* Actions */}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{
                scale: 0.97,
              }}
              onClick={copyUrl}
              className="flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white py-3 text-sm font-semibold text-gray-700"
            >
              {copied ? (
                <Check size={17} />
              ) : (
                <Copy size={17} />
              )}

              {copied
                ? "Copied"
                : "Copy URL"}
            </motion.button>

            <motion.button
              whileTap={{
                scale: 0.97,
              }}
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
            >
              <Download size={17} />

              Download
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}