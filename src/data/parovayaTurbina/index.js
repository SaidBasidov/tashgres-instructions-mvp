import { blocksPart01 } from "./blocksPart01.js";
import { blocksPart02 } from "./blocksPart02.js";
import { blocksPart03 } from "./blocksPart03.js";
import { blocksPart04 } from "./blocksPart04.js";
import { blocksPart05 } from "./blocksPart05.js";
import { blocksPart06 } from "./blocksPart06.js";
import { blocksPart07 } from "./blocksPart07.js";

export const parovayaTurbinaDocument = {
  id: "parovaya-turbina-k-160-130-htgz",
  code: "К-160-130 ХТГЗ",
  title: "Паровая турбина К-160-130 ХТГЗ",
  type: "Техническая книга / справочное руководство",
  department: "Турбинное оборудование",
  equipmentArea: "Паровая турбина",
  sourceFile: "Паровая турбина К-160-130 ХТГЗ.pdf",
  textQuality: "cleaned_ocr_requires_review",
  purpose: "reference",
  purposeLabel: "Справочное описание",
  category: "turbine",
  categoryLabel: "Турбинное оборудование",
  blocks: [
    ...blocksPart01,
    ...blocksPart02,
    ...blocksPart03,
    ...blocksPart04,
    ...blocksPart05,
    ...blocksPart06,
    ...blocksPart07,
  ],
};