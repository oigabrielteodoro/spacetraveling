import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const applyUppercase = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatDate = (dateToFormat: string) => {
  const monthFormatted = applyUppercase(
    format(new Date(dateToFormat), 'MMM', {
      locale: ptBR,
    })
  );

  return format(new Date(dateToFormat), `dd '${monthFormatted}' yyyy`);
};
