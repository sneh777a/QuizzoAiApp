import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = formData;

    const result = await register(registerData);

    if (!result.success) {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app py-12 px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="w-full max-w-md space-y-8 modern-card p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary theme-transition">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary theme-transition">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 theme-transition"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-error-50 dark:bg-error-900/30 p-4 theme-transition">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-light dark:text-error-dark theme-transition">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="modern-input relative block w-full rounded-t-md border-0 py-1.5 sm:text-sm sm:leading-6"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="modern-input relative block w-full border-0 py-1.5 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="modern-input relative block w-full border-0 py-1.5 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="modern-input relative block w-full rounded-b-md border-0 py-1.5 sm:text-sm sm:leading-6"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="modern-button group relative flex w-full justify-center py-2 px-3 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
