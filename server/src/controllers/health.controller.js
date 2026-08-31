/**
 * @desc    Simple Health Check Endpoint
 * @route   GET /health or GET /api/v1/health
 * @access  Public
 */
export const getHealthStatus = (req, res) => {
  res.status(200).send("working");
};
