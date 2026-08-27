import { siteUrl } from "@/lib/site-url";
export async function POST(){return Response.redirect(`${siteUrl()}/cart`,303)}
export async function GET(){return Response.redirect(`${siteUrl()}/cart`,303)}
