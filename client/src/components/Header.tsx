// src/components/Header.jsx
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import {ModeToggle} from "./ModeToggle"; 
import Auth from "../utils/auth";
import SearchBar from "./SearchBar";
import Watchlist from "./Watchlist";
import Draggable from 'react-draggable'; 
// import '../styles/Watchlist.scss'
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  navigationItemStyle,
} from "@/components/ui/navigation-menu"


const Header = () => {
  const [watchListClose, setWatchListClose] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    Auth.logout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleWatchlist = () => {
    setWatchListClose(!watchListClose);
  };

  const components: { title: string; href: string; description: string }[] = [
    {
      title: "Glossary",
      href: "/glossary",
      description:
        "A list of terms in a particular domain of knowledge with the definitions for those terms.",
    },
    {
      title: "Linear Regression",
      href: "/linear-regression",
      description:
        "A linear approach to modeling the relationship between a scalar response and one or more explanatory variables.",
    },
    {
      title: "Learning",
      href: "/",
      description:
        "Learn how to invest in the stock market and becommes a successful investor.",
    },
    {
      title: "News",
      href: "/",
      description: "The latest news on the stock market.",
    },
    {
      title: "Analysis",
      href: "/",
      description:
        "Use our tools to analyze the stock market and make informed decisions.",
    },
  ]
  const path = window.location.pathname
  const [hamburger, setHamburger] = React.useState(false);

  return (
    <>
      <header className="header-main main-nav bg-background">
        <div className="d-flex justify-content-around align-items-center ">
          <Navbar.Brand className="logo-cinco d-flex align-items-center">
            <Link to="/" className="navbar-brand ms-2">
              CincoData [ ]
            </Link>
          </Navbar.Brand>
          <SearchBar className="search-bar" />
          <nav className="sticky flex items-center justify-between top-0  z-50 ">
      <div className="p-1">
      </div>
      <NavigationMenu className={`space-x-4 top-0 right-0 border-l pl-4 mr-3 nav-menu ${hamburger ? 'open' : ''}`}>
        <NavigationMenuList>
        <NavigationMenuItem className={`hamburger ${navigationMenuTriggerStyle()}`} onClick={() => setHamburger(!hamburger)}>
        <NavigationMenuTrigger >
          Menu
        </NavigationMenuTrigger>
        </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-5 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      {/* <Icons.logo className="h-6 w-6" /> */}
                      <div className="mb-2 mt-4 text-lg font-medium">
                       CincoData
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Get started with our website!
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/" title="Introduction">
                  Click here to learn more about our website.
                </ListItem>
                <ListItem href="/" title="Tutorial">
                  How to use our website.
                </ListItem>
                <ListItem href="/dashboard" title="Members">
                  Dashboard
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink
              className={navigationItemStyle()}>
                About
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem className="ml-5 mr-5">
            <ModeToggle />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
          <div className="login-buttons">
            {Auth.loggedIn() ? (
              <button type="button" className="button-2" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <button type="button" className="button-3" onClick={handleLogin}>Log In</button>
                <button type="button" className="button-2" onClick={handleSignup}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>
      {watchListClose ? null : 
        <Draggable> 
          <div className="watchlist-container">
            <div className="d-flex justify-content-end">
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleWatchlist}></button>
            </div>
            <Watchlist />
          </div>
        </Draggable>
      }
    </>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Header;
