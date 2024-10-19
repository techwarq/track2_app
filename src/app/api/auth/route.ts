import { NextResponse } from "next/server";

export const GET = async() =>{
    const clientId = process.env.CLIENT_ID;

    if(!clientId){
        return NextResponse.json({error: 'Missing Client Id'}, { status: 500 });

    }

    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    return NextResponse.redirect(redirectUrl);

  
}