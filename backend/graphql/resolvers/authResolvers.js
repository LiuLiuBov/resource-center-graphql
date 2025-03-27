const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { AuthenticationError, ApolloError, UserInputError } = require("apollo-server-express");

const User = require("../../models/User");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  Query: {
    async getUserById(_, { id }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      const foundUser = await User.findById(id).select("-password");
      if (!foundUser) {
        throw new ApolloError("Користувача не знайдено", "USER_NOT_FOUND");
      }
      return foundUser;
    },
  },

  Mutation: {
    async registerUser(
      _,
      { name, email, password, confirmPassword, phone, location, bio },
      context
    ) {
      if (password !== confirmPassword) {
        throw new UserInputError("Паролі не співпадають");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError("Цей email вже зареєстрований");
      }

      const icons = ["user_icon2.jpeg", "user_icon4.jpeg"];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];

      const newUser = new User({
        name,
        email,
        password,
        role: "user",
        phone: phone || "",
        location: location || "",
        bio: bio || "",
        emailVerified: false,
        verificationToken: crypto.randomBytes(32).toString("hex"),
        profilePicture: randomIcon,
      });

      await newUser.save();

      const verificationLink = `http://localhost:8000/api/auth/verify-email?token=${newUser.verificationToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Підтвердіть вашу електронну пошту",
        html: `<p>Будь ласка, підтвердіть вашу електронну пошту, натиснувши <a href="${verificationLink}">тут</a>.</p>`,
      });

      return "Користувач успішно зареєстрований. Перевірте пошту для підтвердження.";
    },

    async loginUser(_, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new UserInputError("Користувач не знайдений");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UserInputError("Невірний пароль");
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        token,
        user,
      };
    },

    async verifyEmail(_, { token }) {
      if (!token) {
        throw new UserInputError("Невірне посилання");
      }

      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        throw new UserInputError("Недійсний токен");
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      await user.save();

      return "Email успішно верифіковано. Ви можете увійти в систему.";
    },

    async updateProfile(_, { phone, location, bio, profilePicture }, { user }) {
      if (!user) throw new AuthenticationError("Немає доступу");

      const userDoc = await User.findById(user.id);
      if (!userDoc) {
        throw new ApolloError("User not found");
      }

      userDoc.phone = phone || userDoc.phone;
      userDoc.location = location || userDoc.location;
      userDoc.bio = bio || userDoc.bio;
      userDoc.profilePicture = profilePicture || userDoc.profilePicture;

      await userDoc.save();
      return userDoc;
    },
  },
};
