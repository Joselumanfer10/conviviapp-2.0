import { simplifyDebts, Balance, Transfer } from '../../src/utils/simplifyDebts';

describe('simplifyDebts', () => {
  // Helper: sumar transferencias por usuario para verificar consistencia
  const sumTransfersFrom = (transfers: Transfer[], userId: string) =>
    transfers
      .filter((t) => t.from === userId)
      .reduce((sum, t) => sum + t.amount, 0);

  const sumTransfersTo = (transfers: Transfer[], userId: string) =>
    transfers
      .filter((t) => t.to === userId)
      .reduce((sum, t) => sum + t.amount, 0);

  describe('caso básico: 2 personas', () => {
    it('un deudor y un acreedor', () => {
      const balances: Balance[] = [
        { userId: 'ana', amount: 50 }, // Ana pagó de más -> se le debe
        { userId: 'bob', amount: -50 }, // Bob debe 50€
      ];

      const transfers = simplifyDebts(balances);

      expect(transfers).toHaveLength(1);
      expect(transfers[0]).toEqual({
        from: 'bob',
        to: 'ana',
        amount: 50,
      });
    });
  });

  describe('múltiples deudores y acreedores', () => {
    it('ejemplo del proyecto: 4 personas, 3 transferencias', () => {
      // Del ejemplo en MEMORIA_PROYECTO.md:
      // Ana pagó 200€, debía 75€ -> balance +125€
      // Bob pagó 100€, debía 75€ -> balance +25€
      // Carlos pagó 0€, debía 75€ -> balance -75€
      // Diana pagó 0€, debía 75€ -> balance -75€
      const balances: Balance[] = [
        { userId: 'ana', amount: 125 },
        { userId: 'bob', amount: 25 },
        { userId: 'carlos', amount: -75 },
        { userId: 'diana', amount: -75 },
      ];

      const transfers = simplifyDebts(balances);

      // Debe minimizar transferencias (max 3 para 4 personas)
      expect(transfers.length).toBeLessThanOrEqual(3);

      // Verificar que los balances se equilibran
      // Carlos debe pagar 75€ total
      const carlosTotal = sumTransfersFrom(transfers, 'carlos');
      expect(carlosTotal).toBe(75);

      // Diana debe pagar 75€ total
      const dianaTotal = sumTransfersFrom(transfers, 'diana');
      expect(dianaTotal).toBe(75);

      // Ana debe recibir 125€ total
      const anaTotal = sumTransfersTo(transfers, 'ana');
      expect(anaTotal).toBe(125);

      // Bob debe recibir 25€ total
      const bobTotal = sumTransfersTo(transfers, 'bob');
      expect(bobTotal).toBe(25);

      // Total transferido == total deuda
      const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);
      expect(totalTransferred).toBe(150);
    });

    it('3 deudores y 2 acreedores', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 100 },
        { userId: 'b', amount: 50 },
        { userId: 'c', amount: -60 },
        { userId: 'd', amount: -40 },
        { userId: 'e', amount: -50 },
      ];

      const transfers = simplifyDebts(balances);

      // Total deuda = 150, total crédito = 150
      const totalFrom = transfers.reduce((sum, t) => sum + t.amount, 0);
      expect(totalFrom).toBe(150);

      // Cada deudor no debe pagar más de lo que debe
      expect(sumTransfersFrom(transfers, 'c')).toBe(60);
      expect(sumTransfersFrom(transfers, 'd')).toBe(40);
      expect(sumTransfersFrom(transfers, 'e')).toBe(50);

      // Cada acreedor no debe recibir más de lo que se le debe
      expect(sumTransfersTo(transfers, 'a')).toBe(100);
      expect(sumTransfersTo(transfers, 'b')).toBe(50);
    });
  });

  describe('balances ya equilibrados', () => {
    it('retorna vacío si todos los balances son cero', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 0 },
        { userId: 'b', amount: 0 },
        { userId: 'c', amount: 0 },
      ];

      const transfers = simplifyDebts(balances);
      expect(transfers).toHaveLength(0);
    });

    it('retorna vacío si no hay participantes', () => {
      const transfers = simplifyDebts([]);
      expect(transfers).toHaveLength(0);
    });

    it('ignora balances cercanos a cero (menores que EPSILON)', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 0.005 },
        { userId: 'b', amount: -0.005 },
      ];

      const transfers = simplifyDebts(balances);
      expect(transfers).toHaveLength(0);
    });
  });

  describe('montos con decimales', () => {
    it('maneja correctamente montos con céntimos', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 33.33 },
        { userId: 'b', amount: -16.67 },
        { userId: 'c', amount: -16.66 },
      ];

      const transfers = simplifyDebts(balances);

      // Todos los montos deben tener máximo 2 decimales
      transfers.forEach((t) => {
        const decimals = t.amount.toString().split('.')[1];
        expect(decimals ? decimals.length : 0).toBeLessThanOrEqual(2);
      });

      // Total recibido por 'a' debe ser ~33.33
      const aReceived = sumTransfersTo(transfers, 'a');
      expect(aReceived).toBeCloseTo(33.33, 1);
    });

    it('redondea transferencias a 2 decimales', () => {
      // Simular un gasto de 100€ dividido entre 3 (33.333...)
      const balances: Balance[] = [
        { userId: 'a', amount: 66.67 }, // pagó 100, debe 33.33
        { userId: 'b', amount: -33.33 },
        { userId: 'c', amount: -33.34 },
      ];

      const transfers = simplifyDebts(balances);

      transfers.forEach((t) => {
        // Verificar que el monto es un número con máximo 2 decimales
        expect(t.amount).toBe(Math.round(t.amount * 100) / 100);
      });
    });
  });

  describe('casos especiales', () => {
    it('un solo usuario no genera transferencias', () => {
      const balances: Balance[] = [{ userId: 'solo', amount: 100 }];
      const transfers = simplifyDebts(balances);
      expect(transfers).toHaveLength(0);
    });

    it('todos son deudores (caso teórico) no genera transferencias', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: -50 },
        { userId: 'b', amount: -30 },
      ];

      const transfers = simplifyDebts(balances);
      expect(transfers).toHaveLength(0);
    });

    it('todos son acreedores (caso teórico) no genera transferencias', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 50 },
        { userId: 'b', amount: 30 },
      ];

      const transfers = simplifyDebts(balances);
      expect(transfers).toHaveLength(0);
    });

    it('deudor con monto exacto igual al acreedor', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 100 },
        { userId: 'b', amount: -100 },
      ];

      const transfers = simplifyDebts(balances);

      expect(transfers).toHaveLength(1);
      expect(transfers[0]).toEqual({
        from: 'b',
        to: 'a',
        amount: 100,
      });
    });

    it('muchos participantes con montos pequeños', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 10 },
        { userId: 'b', amount: -2 },
        { userId: 'c', amount: -2 },
        { userId: 'd', amount: -2 },
        { userId: 'e', amount: -2 },
        { userId: 'f', amount: -2 },
      ];

      const transfers = simplifyDebts(balances);

      // Debe haber 5 transferencias (cada deudor paga a 'a')
      expect(transfers).toHaveLength(5);
      transfers.forEach((t) => {
        expect(t.to).toBe('a');
        expect(t.amount).toBe(2);
      });
    });
  });

  describe('invariantes del algoritmo', () => {
    it('la suma de transferencias iguala la deuda total', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 200 },
        { userId: 'b', amount: 50 },
        { userId: 'c', amount: -120 },
        { userId: 'd', amount: -80 },
        { userId: 'e', amount: -50 },
      ];

      const transfers = simplifyDebts(balances);
      const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);
      const totalDebt = balances
        .filter((b) => b.amount < 0)
        .reduce((sum, b) => sum + Math.abs(b.amount), 0);

      expect(totalTransferred).toBeCloseTo(totalDebt, 1);
    });

    it('nadie se paga a sí mismo', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 100 },
        { userId: 'b', amount: -50 },
        { userId: 'c', amount: -50 },
      ];

      const transfers = simplifyDebts(balances);
      transfers.forEach((t) => {
        expect(t.from).not.toBe(t.to);
      });
    });

    it('todos los montos son positivos', () => {
      const balances: Balance[] = [
        { userId: 'a', amount: 75 },
        { userId: 'b', amount: -25 },
        { userId: 'c', amount: -50 },
      ];

      const transfers = simplifyDebts(balances);
      transfers.forEach((t) => {
        expect(t.amount).toBeGreaterThan(0);
      });
    });
  });
});
