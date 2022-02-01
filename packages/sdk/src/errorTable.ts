import { ApiPromise } from "@polkadot/api";

type ErrorTableEntry = {
  errorName: string;
  documentation: string;
};

type ErrorTablePopulated = {
  [key: number]: {
    [key: number]: ErrorTableEntry;
  };
};

type PalletTablePopulated = {
  [key: number]: number;
};

export default class ErrorTable {
  private errors: ErrorTablePopulated;
  private pallets: PalletTablePopulated;

  static async getPallets(api: ApiPromise): Promise<PalletTablePopulated> {
    const metadata = await api.rpc.state.getMetadata();
    const inner = metadata.get("metadata");
    const palletTable = {};

    //@ts-ignore
    for (const pallet of inner.toJSON().v14.pallets) {
      if (pallet.errors) {
        const {
          index,
          errors: { type },
        } = pallet;
        palletTable[index] = type;
      }
    }
    return palletTable;
  }

  static async getErrors(api: ApiPromise): Promise<ErrorTablePopulated> {
    const metadata = await api.rpc.state.getMetadata();
    const inner = metadata.get("metadata");
    const errorTable = {};

    //@ts-ignore
    for (const module of inner.toJSON().v14.lookup.types) {
      if (module.type.path.includes("Error") && module.type.def.variant) {
        const {
          type: {
            def: {
              variant: { variants: errors },
            },
          },
          id: index,
        } = module;
        errorTable[index] = {};
        (errors as Array<{ name: string; docs: Array<string> }>).forEach(
          (error, errorIndex) => {
            const { name: errorName, docs } = error;
            errorTable[index][errorIndex] = {
              errorName,
              documentation: docs.join(" ").trim(),
            };
          }
        );
      }
    }
    return errorTable;
  }

  static async populate(api: ApiPromise): Promise<ErrorTable> {
    const errorTableData = await ErrorTable.getErrors(api);
    const palletTableData = await ErrorTable.getPallets(api);
    return new ErrorTable(errorTableData, palletTableData);
  }

  constructor(
    errorTableData: ErrorTablePopulated,
    palletTableData: PalletTablePopulated
  ) {
    this.errors = errorTableData;
    this.pallets = palletTableData;
  }

  getEntry(palletIndex: number, errorIndex: number): ErrorTableEntry | null {
    if (!this.pallets[palletIndex]) {
      return null;
    }
    const key = this.pallets[palletIndex];
    if (!this.errors[key][errorIndex]) {
      return null;
    }
    return this.errors[key][errorIndex];
  }
}
