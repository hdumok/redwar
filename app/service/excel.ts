'use strict';

import { Context, Service } from 'egg';

import * as fs from 'fs';
import * as xlsx from 'xlsx';

export default class ExcelService extends Service {
  public async write(filename: string, title: string, data: any[]): Promise<string> {
    const url = '/' + filename + '.xlsx';

    const file = __dirname + '/../public' + url;

    const wb = {
      SheetNames: [ title ],
      Sheets: {},
    };

    function writeSheet(data) {
      const sheet = {};
      const range = { s: { c: 100000, r: 100000 }, e: { c: 0, r: 0 } };
      for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < data[row].length; col++) {
          if (range.s.r > row) range.s.r = row;
          if (range.s.c > col) range.s.c = col;
          if (range.e.r < row) range.e.r = row;
          if (range.e.c < col) range.e.c = col;

          // 如果该行该列值未空
          if (data[row][col] === null) continue;

          const cell = {
            v: data[row][col],
            t: 's',
          };

          const location = xlsx.utils.encode_cell({ c: col, r: row });
          sheet[location] = cell;
        }
      }

      if (range.s.c < 100000) sheet['!ref'] = xlsx.utils.encode_range(range);

      return sheet;
    }

    wb.Sheets[title] = writeSheet(data);

    await xlsx.writeFile(wb, file);

    setTimeout(() => {
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        fs.unlinkSync(file);
      }
    }, 5 * 60 * 1000);

    return url;
  }
}
