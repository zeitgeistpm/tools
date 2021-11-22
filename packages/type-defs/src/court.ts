export default {
  rpc: {},
  types: {
    Juror: {
      status: "JurorStatus",
    },
    JurorStatus: {
      _enum: ["OK", "Tardy"],
    },
  },
};
