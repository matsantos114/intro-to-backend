import { User } from "../models/user.model.js";

const registeredUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "all fields are important" });
    }

    // check
    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(400).json({ message: "user already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      loggedIn: false,
    });

    res.status(201).json({
      message: "User registered",
      user: { id: user._id, email: user.email, username: username },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    // if the user already exists
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({
        message: "Invalid Credentials",
      });

    res.status(200).json({
      message: "User Logged In",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // retrieve request body data
    //checks / validations
    // business logic
    // update db
    // send response
    const { email } = req.body;

    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
};

export { registeredUser, loginUser, logoutUser };
