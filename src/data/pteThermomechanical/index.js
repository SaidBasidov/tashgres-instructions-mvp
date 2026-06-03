import { blocksPart01 } from "./blocksPart01.js";
import { blocksPart02 } from "./blocksPart02.js";
import { blocksPart03 } from "./blocksPart03.js";
import { blocksPart04 } from "./blocksPart04.js";
import { blocksPart05 } from "./blocksPart05.js";

export const pteThermomechanicalDocument = {
  id: "pte-teplomehanicheskaya-chast-posobie",
  code: "ПТЭ / тепломеханическая часть",
  title:
    "Пособие для изучения Правил технической эксплуатации электрических станций и сетей. Тепломеханическая часть",
  type: "Пособие / справочный документ",
  department: "Тепломеханическое оборудование",
  equipmentArea:
    "Топливное хозяйство, котельные установки, турбины, тепловые сети",
  sourceFile:
    "Пособие_по_изучению_ПТЭ_восстановленная_текстовая_версия.pdf",
  effectiveDate: "2004",
  textQuality: "cleaned_text_layer_requires_review",
  summary:
    "Пособие содержит пояснения к правилам технической эксплуатации тепломеханического оборудования электростанций и тепловых сетей: топливно-транспортное хозяйство, жидкое и газообразное топливо, котельные установки, турбинные установки, водно-химический режим, тепловые сети и вспомогательное оборудование.",
  blocks: [
    ...blocksPart01,
    ...blocksPart02,
    ...blocksPart03,
    ...blocksPart04,
    ...blocksPart05,
  ],
};