import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  userName: string;
  email: string;
  fullName: string;
  password: string;
  avatar?: string;
  coverImage?: string;
  refreshToken?: string;
  videoHistory: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // by add index help optimized search in mongodb and donot add index in every field destroys optimisation
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },
    videoHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "VideoHistory",
      },
    ],
    avatar: {
      type: String, // from cloudary
    },
    coverImage: {
      type: String, // from cloudary
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJwtTokens = function () {
  jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.SECRET_ACCESS_TOKEN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expireIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};

export const User = mongoose.model("User", userSchema);
