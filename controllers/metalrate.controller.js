const SimplePrice =
  require("../models/metalrate");

async function handleMetalDetailAddition(
  req,
  res
) {

  try {

    console.log(req.body);

    await SimplePrice.insertMany(
      req.body
    );

    return res.json({

      success: true,

      message:
        "Metal rates added"

    });

  } catch(error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      error: error.message

    });

  }

}

async function handleGetMetal(req, res) {
    try{
        const allMetalsData = await SimplePrice.find();
        return res.json(allMetalsData);
    }catch(error){
        console.log(error)
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
  handleMetalDetailAddition,
  handleGetMetal,
};