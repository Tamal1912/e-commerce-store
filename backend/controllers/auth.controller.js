import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const access_token = jwt.sign({ userId }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const refresh_token = jwt.sign({ userId }, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return { access_token, refresh_token };
};

const storeRefreshTokens = async (userId, refresh_token) => {
  await redis.set(
    `refresh_token:${userId}`,
    refresh_token,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days Expiry Time
};

const setCookies = (res, access_token, refresh_token) => {
  res.cookie("access_token", access_token, {
    httpOnly: true, // restrict XSS attack
    secure: process.env.NODED_ENV === "production",
    sameSite: "strict", // restrict cross-site attack
    maxAge: 15 * 60 * 1000, //15min
  });

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true, // restrict XSS attack
    secure: process.env.NODED_ENV === "production",
    sameSite: "strict", // restrict cross-site attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    //authenticate user

    const { access_token, refresh_token } = generateTokens(user._id);

    await storeRefreshTokens(user._id, refresh_token);

    //cookies setting
    setCookies(res, access_token, refresh_token);

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in signup controller");
    return res
      .status(500)
      .json({ message: "Something went wrong at saving user" });
  }
};

export const login = async (req, res) => {
  try {
      
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      
      console.log("here 1");
      console.log(req.body);
      // if (!user) {
        //     return res.status(404).json({ message: "User not found" });
        // }
        
        if (user && (await user.comparePassword(password))) {
      console.log("here 3");
      //authenticate user
      const { access_token, refresh_token } = generateTokens(user._id);
      await storeRefreshTokens(user._id, access_token, refresh_token);
      //cookies setting
      setCookies(res, access_token, refresh_token);
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("Error in Login controller");

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout controller");
    
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const refreshAccessToken=async(req,res)=>{

    try {
        const refreshToken=req.cookies.refresh_token;
        if(!refreshToken){    
            return res.status(401).json({message:"no refresh token provided"});
        }

        const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN);
        const stored_Token=await redis.get(`refresh_token:${decoded.userId}`);

        if(stored_Token !== refreshToken){
            return res.status(401).json({message:"Invalid refresh token"});
        }

        const access_token=jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN,{expiresIn:"15m"});

        res.cookie("access_token",access_token,{
            httpOnly:true,
            secure:process.env.NODED_ENV==="production",
            sameSite:"strict",
            maxAge:15*60*1000,
        });
        res.json({message:"Access token refreshed"});
    } catch (error) {
        console.log("Error in refreshAccessToken controller");
        res.status(500).json({message:"Server Error",error:error.message});
        
    }
}

