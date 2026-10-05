"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Logo } from "@/components/logo"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  return (
    <NavigationMenu className="w-full max-w-svw">
      <NavigationMenuList className="w-full">
        <NavigationMenuItem className="mr-auto">
          <NavigationMenuLink
            render={<Link href="/" />}
            className={navigationMenuTriggerStyle()}
          >
            Hem
          </NavigationMenuLink>
        </NavigationMenuItem>

        {isLoggedIn ? (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link
                    href="/login"
                    onClick={() => {
                      sessionStorage.removeItem("token")
                      setIsLoggedIn(false)
                    }}
                  />
                }
                className={navigationMenuTriggerStyle()}
              >
                Logga ut
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<Link href="/account" />}
                className={navigationMenuTriggerStyle()}
              >
                Mitt konto
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        ) : (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<Link href="/login" />}
                className={navigationMenuTriggerStyle()}
              >
                Logga in
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={<Link href="/register" />}
                className={navigationMenuTriggerStyle()}
              >
                Skapa användare
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
