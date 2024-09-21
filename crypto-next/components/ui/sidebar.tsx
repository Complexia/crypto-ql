"use client";

import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
        <li>
          <Link href="/">
            <button className="btn btn-ghost btn-block justify-start">
              Dashboard
            </button>
          </Link>
        </li>
        <li>
          <Link href="/wallet">
            <button className="btn btn-ghost btn-block justify-start">
              Wallet
            </button>
          </Link>
        </li>
        <li>
          <Link href="/friends">
            <button className="btn btn-ghost btn-block justify-start">
              Friends
            </button>
          </Link>
        </li>
        <li>
          <Link href="/test">
            <button className="btn btn-ghost btn-block justify-start">
              DeFi
            </button>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
