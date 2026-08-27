function site(){return (process.env.PUBLIC_SITE_URL||"http://127.0.0.1:3000").replace(/\/$/,"");}
export async function POST(){return Response.redirect(`${site()}/cart`,303)}
export async function GET(){return Response.redirect(`${site()}/cart`,303)}
