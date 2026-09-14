import axios from "axios"

export { cn } from "cn"

export const api = axios.create({
  baseURL: "https://money-management-api.fsm.web.id",
})
