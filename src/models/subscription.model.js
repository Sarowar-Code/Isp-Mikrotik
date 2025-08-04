const subscriptionPlanSchema = new Schema({
  packageName: {
    type: String,
    required: true,
    trim: true,
  }, // e.g., "Plan 300"
  maxClients: {
    type: Number,
    required: true,
  }, // PPP user limit
  price: {
    type: Number,
    required: true,
  }, // Price in BDT
  billingCycle: {
    type: String,
    default: "Monthly",
  },
});

export const SubscriptionPlan = model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
