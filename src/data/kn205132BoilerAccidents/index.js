import { blocksPart01 } from "./blocksPart01.js";
import { blocksPart02 } from "./blocksPart02.js";
import { blocksPart03 } from "./blocksPart03.js";
import { blocksPart04 } from "./blocksPart04.js";
import { blocksPart05 } from "./blocksPart05.js";

export const kn205132BoilerAccidentsDocument = {
  id: "kn-205-132-2023",
  code: "КН 205-132:2023",
  title: "Инструкция. Предупреждение и ликвидация аварий на котле ТГМ-94",
  type: "Нормативный документ",
  department: "Котлотурбинный цех - 1, 2",
  equipmentArea: "Котел ТГМ-94",
  effectiveDate: "01.11.2023",
  sourceFile: "КН_205-132-2023_ФИНАЛЬНЫЙ_текстовый_без_сканов_V2.pdf",
  textQuality: "cleaned_text_layer_requires_review",
  purpose: "accident-response",
  purposeLabel: "Ликвидация / предупреждение аварий",
  category: "boiler",
  categoryLabel: "Котельное оборудование",
  summary:
    "Инструкция определяет порядок предупреждения и ликвидации аварий на котле ТГМ-94: аварийный останов блока и котла, упуск и перепитка барабана, выход из строя питательных насосов, повышение давления, повреждение труб, снижение давления газа и мазута, погасание факела, взрывы в топке и газоходах, загорание сажи и РВП, отключение дымососов, дутьевых вентиляторов, потеря КИПиА, потеря собственных нужд, нарушения водно-химического режима и техника безопасности.",
  blocks: [
    ...blocksPart01,
    ...blocksPart02,
    ...blocksPart03,
    ...blocksPart04,
    ...blocksPart05,
  ],
};