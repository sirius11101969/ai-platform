const { seedDemoSalesPipeline } = require('../models/demoSalesPipelineModel')

async function seedSalesPipeline(req, res, next) {
  try {
    const result = await seedDemoSalesPipeline(req.user.id, req.workspace.id)
    res.status(result.alreadyExists ? 200 : 201).json({
      success: true,
      message: result.alreadyExists ? 'Демо-воронка уже создана.' : 'Демо-воронка создана.',
      ...result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { seedSalesPipeline }
