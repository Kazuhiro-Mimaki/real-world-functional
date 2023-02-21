import { Link } from "@remix-run/react";

export const Header = () => {
  return (
    <header className="bg-white py-2.5 rounded-b w-full shadow-md shadow-gray-300">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link to="/">
          <span className="self-center text-primary text-2xl font-titillium whitespace-nowrap ">
            conduit
          </span>
        </Link>

        <nav className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
          <Link to="/">Home</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Sign up</Link>
        </nav>
      </div>
    </header>
  );
};
