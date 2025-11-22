import mongoose from "mongoose";
import { Wallet } from "../models/wallet.model.js";
import { WalletTransaction } from "../models/walletTransaction.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const rechargeWallet = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { resellerId, amount, method, notes = "" } = req.body;
    const adminId = req.auth._id; // From auth middleware

    // Update wallet
    const wallet = await Wallet.findOneAndUpdate(
      { resellerId },
      {
        $inc: { balance: amount }, // This ADDS the amount to the existing balance
        $set: { lastTopUp: new Date() },
      },
      { new: true, upsert: true, session }
    );

    // Create transaction
    const transaction = new WalletTransaction({
      resellerId,
      amount,
      type: "recharge",
      paymentMethod: method,
      status: "completed",
      processedBy: adminId,
      notes: notes || `Recharged ${amount} BDT via ${method}`,
      transactionDate: new Date(),
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          balance: wallet.balance,
          transactionId: transaction._id,
        },
        "Wallet recharged successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    res
      .status(400)
      .json(
        new ApiResponse(400, { error: error.message }, "Wallet recharge failed")
      );
  } finally {
    session.endSession();
  }
});

export { rechargeWallet };
