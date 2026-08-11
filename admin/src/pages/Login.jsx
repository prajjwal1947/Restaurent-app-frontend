import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Utensils,
  ShoppingBag,
  ChefHat,
} from "lucide-react";

import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (credentials) => {
    console.log(
      "Login credentials:",
      credentials
    );

    localStorage.setItem(
      "admin-authenticated",
      "true"
    );

    localStorage.setItem(
      "admin-email",
      credentials.email
    );

    navigate("/", {
      replace: true,
    });

    // Later:
    // POST /api/auth/login
  };

  const handleForgotPassword = ({ email }) => {
    console.log(
      "Forgot password request:",
      email
    );

    // Later:
    // POST /api/auth/forgot-password
  };

  const handleCreateAccount = (payload) => {
    console.log(
      "Create account payload:",
      payload
    );

    localStorage.setItem(
      "admin-name",
      payload.ownerName || "Admin"
    );

    localStorage.setItem(
      "admin-email",
      payload.ownerEmail || ""
    );

    localStorage.setItem(
      "restaurant-name",
      payload.restaurantName || ""
    );

    localStorage.setItem(
      "admin-photo",
      payload.ownerPhoto || ""
    );

    // Later:
    // POST /api/auth/register
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf5]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT - BRAND */}

        <div className="relative hidden overflow-hidden bg-[#e86a33] lg:flex">
          
          {/* Decorative circles */}

          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"
          />

          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/10"
          />

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <motion.div
              initial={{
                opacity: 0,
                y: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
                🍽️
              </div>

              <div>
                <h2 className="font-bold text-white">
                  DineFlow
                </h2>

                <p className="text-xs text-white/60">
                  Restaurant Management
                </p>
              </div>
            </motion.div>

            {/* Main visual */}

            <div className="max-w-lg">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="relative mx-auto mb-10 flex h-72 w-72 items-center justify-center"
              >

                {/* Outer ring */}

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border border-dashed border-white/30"
                />

                {/* Main card */}

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-52 w-64 flex-col justify-between rounded-3xl bg-white p-5 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#e86a33]">
                      <ChefHat
                        size={21}
                      />
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600">
                      OPEN
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      TODAY'S ORDERS
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      128
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-orange-100">
                      <div className="h-full w-3/4 rounded-full bg-[#e86a33]" />
                    </div>

                    <span className="text-[10px] text-gray-400">
                      75%
                    </span>
                  </div>
                </motion.div>

                {/* Floating icons */}

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute -left-2 top-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl"
                >
                  <QrCode
                    className="text-[#e86a33]"
                  />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                  }}
                  className="absolute -right-2 bottom-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl"
                >
                  <ShoppingBag
                    className="text-[#e86a33]"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
              >
                <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                  Your restaurant,
                  <br />
                  <span className="text-orange-100">
                    beautifully managed.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
                  Manage tables, QR ordering, menu
                  items and incoming orders from
                  one simple dashboard.
                </p>
              </motion.div>
            </div>

            {/* Bottom */}

            <div className="flex items-center gap-6 text-xs text-white/50">
              <span className="flex items-center gap-2">
                <QrCode size={15} />
                QR Ordering
              </span>

              <span className="flex items-center gap-2">
                <Utensils size={15} />
                Menu Management
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT - LOGIN */}

        <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">

          {/* Mobile logo */}

          <div className="absolute left-6 top-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e86a33] text-lg">
              🍽️
            </div>

            <span className="font-bold text-gray-900">
              DineFlow
            </span>
          </div>

          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={
              handleForgotPassword
            }
            onCreateAccount={
              handleCreateAccount
            }
          />
        </div>
      </div>
    </div>
  );
}