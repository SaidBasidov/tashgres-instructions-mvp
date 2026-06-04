import { blocksPart01 } from "./blocksPart01.js";
import { blocksPart02 } from "./blocksPart02.js";
import { blocksPart03 } from "./blocksPart03.js";

export const kn205131TurbineAccidentsDocument = {
  id: "kn-205-131-2023",
  code: "КН 205-131:2023",
  title:
    "Инструкция. Предупреждение и ликвидация аварий на турбине типа К-160-130 и ПВК-150",
  type: "Нормативный документ",
  department: "Котлотурбинный цех - 1, 2",
  equipmentArea: "Паровая турбина К-160-130 и ПВК-150",
  effectiveDate: "01.11.2023",
  sourceFile: "КН_205-131-2023_ФИНАЛЬНЫЙ_текстовый_без_сканов.pdf",
  textQuality: "cleaned_text_layer_requires_review",
  purpose: "accident-response",
  purposeLabel: "Ликвидация / предупреждение аварий",
  category: "turbine",
  categoryLabel: "Турбинное оборудование",
  summary:
    "Инструкция определяет порядок предупреждения и ликвидации аварий на турбине типа К-160-130 и ПВК-150: аварийный останов турбогенератора, действия защит и персонала, снижение нагрузки, осевой сдвиг ротора, вибрация, гидравлические удары, понижение вакуума, неполадки системы смазки, потеря собственных нужд, сброс нагрузки, изменение параметров пара, частоты системы и качества основного конденсата.",
  blocks: [...blocksPart01, ...blocksPart02, ...blocksPart03],
};