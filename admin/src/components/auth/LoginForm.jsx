import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Building2,
  Phone,
  User,
  Upload,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function LoginForm({
  onLogin,
  onForgotPassword,
  onCreateAccount,
}) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [resetSent, setResetSent] =
    useState(false);

  const [accountCreated, setAccountCreated] =
    useState(false);

  const [createData, setCreateData] =
    useState({
      restaurantName: "",
      restaurantEmail: "",
      phone: "",
      ownerName: "",
      ownerEmail: "",
      ownerPassword: "",
      confirmPassword: "",
      address: "",
      city: "",
      restaurantLogo: "",
      ownerPhoto: "",
    });

  const [createError, setCreateError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showCreatePassword, setShowCreatePassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const updateCreateData = (field, value) => {
    setCreateData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const fileToDataUrl = (file, onDone) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onDone(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = (field) => (e) => {
    const file = e.target.files?.[0];

    fileToDataUrl(file, (url) => {
      updateCreateData(field, url);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Temporary login simulation
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    setLoading(false);

    const tempEmail =
      email || "demo@restaurant.com";

    const tempPassword =
      password || "temp-1234";

    onLogin?.({
      email: tempEmail,
      password: tempPassword,
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) return;

    setLoading(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 900)
    );
    setLoading(false);
    setResetSent(true);

    onForgotPassword?.({
      email: forgotEmail,
    });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    setCreateError("");
    setAccountCreated(false);

    const requiredFields = [
      "restaurantName",
      "restaurantEmail",
      "phone",
      "ownerName",
      "ownerEmail",
      "ownerPassword",
      "confirmPassword",
      "address",
      "city",
    ];

    const hasMissing = requiredFields.some(
      (field) => !createData[field]
    );

    if (hasMissing) {
      setCreateError(
        "Please fill all required details."
      );
      return;
    }

    if (
      createData.ownerPassword !==
      createData.confirmPassword
    ) {
      setCreateError(
        "Password and confirm password must match."
      );
      return;
    }

    setLoading(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );
    setLoading(false);

    onCreateAccount?.(createData);

    setAccountCreated(true);

    setTimeout(() => {
      setMode("login");
      setEmail(createData.ownerEmail);
      setPassword("");
      setAccountCreated(false);
    }, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl"
    >
      {/* Heading */}

      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-semibold text-[#e86a33]">
            {mode === "login" &&
              "RESTAURANT ADMIN"}
            {mode === "forgot" &&
              "PASSWORD ASSISTANCE"}
            {mode === "create" &&
              "NEW RESTAURANT SETUP"}
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            {mode === "login" &&
              "Welcome back"}
            {mode === "forgot" &&
              "Forgot password"}
            {mode === "create" &&
              "Create account"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {mode === "login" &&
              "Sign in to manage your restaurant, menu and orders."}
            {mode === "forgot" &&
              "Enter your email and we will send reset instructions."}
            {mode === "create" &&
              "Tell us about your restaurant and owner details to set up your admin workspace."}
          </p>
        </motion.div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-orange-100 bg-white p-1">
        <ModeButton
          active={mode === "login"}
          onClick={() => setMode("login")}
          label="Sign in"
        />

        <ModeButton
          active={mode === "forgot"}
          onClick={() => {
            setMode("forgot");
            setResetSent(false);
          }}
          label="Forgot"
        />

        <ModeButton
          active={mode === "create"}
          onClick={() => setMode("create")}
          label="Create"
        />
      </div>

      {mode === "login" && (
        <motion.form
          key="login"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="w-full"
        >
          {/* Email */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>

            <div className="group relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#e86a33]"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@restaurant.com"
                className="w-full rounded-2xl border border-orange-100 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-300 focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Password */}

          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>

              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setResetSent(false);
                  setForgotEmail(email);
                }}
                className="text-xs font-semibold text-[#e86a33] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="group relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#e86a33]"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-orange-100 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-300 focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#e86a33]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-orange-200 text-[#e86a33] accent-[#e86a33]"
            />

            <span className="text-xs text-gray-500">
              Keep me signed in
            </span>
          </label>

          <motion.button
            whileHover={{
              y: -2,
              boxShadow:
                "0 12px 25px rgba(232,106,51,0.20)",
            }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e86a33] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Signing in...
              </>
            ) : (
              <>
                Sign in

                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          <p className="mt-3 text-center text-xs text-gray-500">
            Temporary mode: click sign in to enter quickly.
          </p>
        </motion.form>
      )}

      {mode === "forgot" && (
        <motion.form
          key="forgot"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleForgotPassword}
          className="w-full"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Registered Email
            </label>

            <div className="group relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#e86a33]"
              />

              <input
                type="email"
                value={forgotEmail}
                onChange={(e) =>
                  setForgotEmail(
                    e.target.value
                  )
                }
                placeholder="owner@restaurant.com"
                className="w-full rounded-2xl border border-orange-100 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-300 focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          {resetSent && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              Reset link sent to {forgotEmail}. Please check your inbox.
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e86a33] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <ShieldCheck size={18} />
            )}
            Send reset link
          </motion.button>
        </motion.form>
      )}

      {mode === "create" && (
        <motion.form
          key="create"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreateAccount}
          className="max-h-[64vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Restaurant Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                icon={Building2}
                label="Restaurant Name"
                value={createData.restaurantName}
                onChange={(value) =>
                  updateCreateData(
                    "restaurantName",
                    value
                  )
                }
                placeholder="Spice Garden"
                required
              />

              <InputField
                icon={Mail}
                label="Restaurant Email"
                type="email"
                value={createData.restaurantEmail}
                onChange={(value) =>
                  updateCreateData(
                    "restaurantEmail",
                    value
                  )
                }
                placeholder="hello@spicegarden.com"
                required
              />

              <InputField
                icon={Phone}
                label="Phone Number"
                type="tel"
                value={createData.phone}
                onChange={(value) =>
                  updateCreateData(
                    "phone",
                    value
                  )
                }
                placeholder="+91 98XXXXXX12"
                required
              />

              <InputField
                icon={MapPin}
                label="City"
                value={createData.city}
                onChange={(value) =>
                  updateCreateData(
                    "city",
                    value
                  )
                }
                placeholder="Bengaluru"
                required
              />
            </div>

            <div className="mt-3">
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Restaurant Address
              </label>

              <textarea
                rows={2}
                value={createData.address}
                onChange={(e) =>
                  updateCreateData(
                    "address",
                    e.target.value
                  )
                }
                className="w-full resize-none rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                placeholder="Full restaurant address"
                required
              />
            </div>

            <div className="mt-3">
              <UploadCard
                label="Restaurant Logo"
                preview={createData.restaurantLogo}
                onUpload={handleImageUpload(
                  "restaurantLogo"
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Owner Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                icon={User}
                label="Owner Name"
                value={createData.ownerName}
                onChange={(value) =>
                  updateCreateData(
                    "ownerName",
                    value
                  )
                }
                placeholder="Rahul Sharma"
                required
              />

              <InputField
                icon={Mail}
                label="Owner Email"
                type="email"
                value={createData.ownerEmail}
                onChange={(value) =>
                  updateCreateData(
                    "ownerEmail",
                    value
                  )
                }
                placeholder="owner@spicegarden.com"
                required
              />

              <PasswordField
                label="Password"
                show={showCreatePassword}
                onToggle={() =>
                  setShowCreatePassword(
                    (current) => !current
                  )
                }
                value={createData.ownerPassword}
                onChange={(value) =>
                  updateCreateData(
                    "ownerPassword",
                    value
                  )
                }
              />

              <PasswordField
                label="Confirm Password"
                show={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                value={createData.confirmPassword}
                onChange={(value) =>
                  updateCreateData(
                    "confirmPassword",
                    value
                  )
                }
              />
            </div>

            <div className="mt-3">
              <UploadCard
                label="Owner Profile Photo"
                preview={createData.ownerPhoto}
                onUpload={handleImageUpload(
                  "ownerPhoto"
                )}
              />
            </div>
          </div>

          {createError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {createError}
            </div>
          )}

          {accountCreated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700"
            >
              Account created successfully. Redirecting to sign in...
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e86a33] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </motion.form>
      )}

      {/* Footer */}

      <p className="mt-7 text-center text-xs text-gray-400">
        Need help accessing your account?{" "}
        <button
          type="button"
          className="font-semibold text-[#e86a33]"
        >
          Contact support
        </button>
      </p>
    </motion.div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#e86a33] text-white"
          : "text-gray-600 hover:bg-orange-50"
      }`}
    >
      {label}
    </button>
  );
}

function InputField({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  show,
  onToggle,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          required
          className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#e86a33]"
        >
          {show ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

function UploadCard({
  label,
  preview,
  onUpload,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-semibold text-[#e86a33] hover:bg-orange-100">
        <Upload size={15} />
        Upload image

        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </label>

      {preview && (
        <img
          src={preview}
          alt={label}
          className="mt-2 h-20 w-20 rounded-xl border border-orange-100 object-cover"
        />
      )}
    </div>
  );
}