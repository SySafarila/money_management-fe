import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"

import Home from "./pages/Home"
import About from "./pages/About"
import Register from "@/pages/Register.tsx"
import Login from "@/pages/Login.tsx"

const rootRoute = createRootRoute()

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  registerRoute,
  loginRoute,
])

export const router = createRouter({
  routeTree,
})
