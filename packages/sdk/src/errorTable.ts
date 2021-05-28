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

export default class ErrorTable {
  private data: ErrorTablePopulated;

  static async generate(api: ApiPromise): Promise<ErrorTablePopulated> {
    const metadata = await api.rpc.state.getMetadata();
    const inner = metadata.get("metadata");
    const errorTable = {};
    //@ts-ignore
    for (const module of inner.toJSON().v12.modules) {
      const { errors, index } = module;
      errorTable[index] = {};
      // skip any that don't have errors
      if (!errors.length) {
        continue;
      }
      (errors as Array<{ name: string; documentation: string }>).forEach(
        (error, errorIndex) => {
          const { name: errorName, documentation } = error;
          errorTable[index][errorIndex] = { errorName, documentation };
        }
      );
    }

    return errorTable;
  }

  static async populate(api: ApiPromise): Promise<ErrorTable> {
    const errorTableData = await ErrorTable.generate(api);
    return new ErrorTable(errorTableData);
  }

  constructor(errorTableData: ErrorTablePopulated) {
    this.data = errorTableData;
  }

  getEntry(palletIndex: number, errorIndex: number): ErrorTableEntry | null {
    if (!this.data[palletIndex]) {
      return null;
    }
    if (!this.data[palletIndex][errorIndex]) {
      return null;
    }

    return this.data[palletIndex][errorIndex];
  }
}
