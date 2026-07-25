// const axios =
//   require("axios");

// const MetalRate =
//   require("../models/metalRate");

// async function updateMetalRates() {

//   try {

//     console.log(
//       "Updating metal rates..."
//     );

//     const response =
//       await axios.get(

//         "https://api.metalpriceapi.com/v1/latest",

//         {
//           params: {

//             api_key:
//               process.env.METAL_API_KEY,

//             base: "INR",

//             currencies: "XAU"

//           }
//         }

//       );

//     const rates =
//       response.data.rates;

//     if (!rates.XAU) {

//       console.log(
//         "Gold rate not found"
//       );

//       return;

//     }

//     // 24K price per gram

//     const gold24k =
//       1 / rates.XAU / 31.1035;

//     // calculate purity rates

//     const gold22k =
//       gold24k * 0.916;

//     const gold18k =
//       gold24k * 0.75;

//     const gold14k =
//       gold24k * 0.583;

//     // SAVE 24K

//     await MetalRate.findOneAndUpdate(

//       {
//         metalType: "Gold",
//         purity: "24K"
//       },

//       {
//         ratePerGram:
//           gold24k,

//         updatedAt:
//           new Date()
//       },

//       {
//         upsert: true
//       }

//     );

//     // SAVE 22K

//     await MetalRate.findOneAndUpdate(

//       {
//         metalType: "Gold",
//         purity: "22K"
//       },

//       {
//         ratePerGram:
//           gold22k,

//         updatedAt:
//           new Date()
//       },

//       {
//         upsert: true
//       }

//     );

//     // SAVE 18K

//     await MetalRate.findOneAndUpdate(

//       {
//         metalType: "Gold",
//         purity: "18K"
//       },

//       {
//         ratePerGram:
//           gold18k,

//         updatedAt:
//           new Date()
//       },

//       {
//         upsert: true
//       }

//     );

//     // SAVE 14K

//     await MetalRate.findOneAndUpdate(

//       {
//         metalType: "Gold",
//         purity: "14K"
//       },

//       {
//         ratePerGram:
//           gold14k,

//         updatedAt:
//           new Date()
//       },

//       {
//         upsert: true
//       }

//     );

//     console.log(
//       "Gold prices updated"
//     );

//   } catch (error) {

//     console.log(error);

//   }

// }

// module.exports =
//   updateMetalRates;