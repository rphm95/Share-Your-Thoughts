// Exporting a function that generates a JWT token and sets it as a cookie
// The function takes the userId and the response object as arguments
// The function generates a JWT token using the jwt.sign() method
// The function sets the JWT token as a cookie using the res.cookie() method
// The cookie is named "jwt"
// The cookie has a maxAge of 15 days
// The cookie is set to be httpOnly
// The cookie is set to be sameSite: "strict"
// The cookie is set to be secure if the NODE_ENV is not "development"
// The function is used in the signup controller to generate a JWT token and set it as a cookie
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, //MS
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
};