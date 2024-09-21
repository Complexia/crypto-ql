// components/Login.tsx
import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import "../../ultilities/fclConfig"; // Import the FCL configuration
import router from "next/router";

interface User {
  addr: string | null;
  loggedIn: boolean | null;
}

const Login = () => {
  const [user, setUser] = useState<User>({ addr: null, loggedIn: null });
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    fcl.currentUser().subscribe(async (user: User) => {
      setUser(user as User);
      // Redirect after successful login
      if (user.loggedIn && user.addr) {
        console.log("herere");
        const account = await fcl.account(user.addr);
        console.log("this is test account ", account);
        setAccount(account);

        const profile = fcl.currentUser();
        console.log("this is test user ", profile);
      }
    });
  }, [router]);

  const logIn = () => fcl.authenticate();
  const logOut = () => fcl.unauthenticate();

  return (
    <div>
      {user.loggedIn ? (
        <div>
          <h3>Address: {account?.address}</h3>
          <h3>Balance: {account?.balance}</h3>
          <h3>Logged in as: {user.addr}</h3>
          <button className="" onClick={logOut}>Log Out</button>
        </div>
      ) : (
        <button onClick={logIn}>Log In</button>
      )}
    </div>
  );
};

export default Login;
