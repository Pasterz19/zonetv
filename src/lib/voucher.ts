/**
 * ZONEtv - Voucher Service
 * Complete voucher and promotional code management
 */

import { PrismaClient } from '@generated/prisma/client';

const db = new PrismaClient();

// Types
export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';

export interface CreateVoucherParams {
  code: string;
  type: VoucherType;
  value: number;
  maxUses?: number;
  maxPerUser?: number;
  validFrom?: Date;
  validUntil?: Date;
  planId?: string;
  description?: string;
  createdBy?: string;
}

export interface ValidateVoucherParams {
  code: string;
  userId: string;
  originalAmount: number;
  planId?: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: {
    id: string;
    code: string;
    type: VoucherType;
    value: number;
    discountAmount: number;
    description?: string | null;
  };
  error?: string;
}

export interface VoucherListOptions {
  active?: boolean;
  type?: VoucherType;
  limit?: number;
  offset?: number;
}

/**
 * Voucher Service Class
 */
export class VoucherService {
  /**
   * Create a new voucher
   */
  async create(params: CreateVoucherParams): Promise<{
    success: boolean;
    voucher?: { id: string; code: string };
    error?: string;
  }> {
    try {
      // Normalize code
      const code = params.code.toUpperCase().trim();

      // Check if code already exists
      const existing = await db.voucher.findUnique({
        where: { code },
      });

      if (existing) {
        return { success: false, error: 'Voucher z tym kodem już istnieje' };
      }

      // Validate value based on type
      if (params.type === 'PERCENTAGE' && (params.value < 1 || params.value > 100)) {
        return { success: false, error: 'Wartość procentowa musi być między 1 a 100' };
      }

      if (params.type === 'FIXED_AMOUNT' && params.value <= 0) {
        return { success: false, error: 'Kwota zniżki musi być większa od 0' };
      }

      if (params.type === 'FREE_TRIAL' && params.value <= 0) {
        return { success: false, error: 'Liczba dni musi być większa od 0' };
      }

      // Create voucher
      const voucher = await db.voucher.create({
        data: {
          code,
          type: params.type,
          value: params.value,
          maxUses: params.maxUses,
          maxPerUser: params.maxPerUser || 1,
          validFrom: params.validFrom || new Date(),
          validUntil: params.validUntil,
          planId: params.planId,
          description: params.description,
          createdBy: params.createdBy,
          isActive: true,
        },
      });

      return {
        success: true,
        voucher: { id: voucher.id, code: voucher.code },
      };
    } catch (error) {
      console.error('Create voucher error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd',
      };
    }
  }

  /**
   * Validate voucher for use
   */
  async validate(params: ValidateVoucherParams): Promise<VoucherValidationResult> {
    try {
      const code = params.code.toUpperCase().trim();

      const voucher = await db.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        return { valid: false, error: 'Nieprawidłowy kod voucheru' };
      }

      if (!voucher.isActive) {
        return { valid: false, error: 'Voucher jest nieaktywny' };
      }

      const now = new Date();

      // Check validity dates
      if (voucher.validFrom > now) {
        return { valid: false, error: 'Voucher nie jest jeszcze aktywny' };
      }

      if (voucher.validUntil && voucher.validUntil < now) {
        return { valid: false, error: 'Voucher wygasł' };
      }

      // Check global usage limit
      if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
        return { valid: false, error: 'Voucher osiągnął limit użyć' };
      }

      // Check user usage limit
      const userUsages = await db.voucherUsage.count({
        where: { voucherId: voucher.id, userId: params.userId },
      });

      if (userUsages >= voucher.maxPerUser) {
        return { valid: false, error: 'Osiągnięto limit użyć tego voucheru' };
      }

      // Check plan restriction
      if (voucher.planId && params.planId && voucher.planId !== params.planId) {
        return { valid: false, error: 'Voucher nie dotyczy wybranego planu' };
      }

      // Calculate discount amount
      let discountAmount = 0;
      switch (voucher.type) {
        case 'PERCENTAGE':
          discountAmount = (params.originalAmount * Number(voucher.value)) / 100;
          break;
        case 'FIXED_AMOUNT':
          discountAmount = Number(voucher.value);
          break;
        case 'FREE_TRIAL':
          discountAmount = params.originalAmount;
          break;
      }

      return {
        valid: true,
        voucher: {
          id: voucher.id,
          code: voucher.code,
          type: voucher.type as VoucherType,
          value: Number(voucher.value),
          discountAmount,
          description: voucher.description,
        },
      };
    } catch (error) {
      console.error('Validate voucher error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Błąd walidacji',
      };
    }
  }

  /**
   * Use voucher (register usage)
   */
  async use(
    voucherId: string,
    userId: string,
    paymentId?: string,
    discountAmount?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already used by this user for this voucher
      const existingUsage = await db.voucherUsage.findUnique({
        where: {
          voucherId_userId: { voucherId, userId },
        },
      });

      if (existingUsage) {
        return { success: false, error: 'Voucher już użyty przez tego użytkownika' };
      }

      // Create usage record
      await db.voucherUsage.create({
        data: {
          voucherId,
          userId,
          paymentId,
          discountAmount: discountAmount || 0,
        },
      });

      // Increment usage counter
      await db.voucher.update({
        where: { id: voucherId },
        data: { currentUses: { increment: 1 } },
      });

      return { success: true };
    } catch (error) {
      console.error('Use voucher error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd użycia voucheru',
      };
    }
  }

  /**
   * Get voucher by code
   */
  async getByCode(code: string): Promise<{
    id: string;
    code: string;
    type: string;
    value: number;
    isActive: boolean;
    currentUses: number;
    maxUses: number | null;
    maxPerUser: number;
    validFrom: Date;
    validUntil: Date | null;
    description: string | null;
    planId: string | null;
  } | null> {
    const voucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) return null;

    return {
      ...voucher,
      value: Number(voucher.value),
    };
  }

  /**
   * List vouchers (admin)
   */
  async list(options: VoucherListOptions = {}): Promise<{
    vouchers: Array<{
      id: string;
      code: string;
      type: string;
      value: number;
      isActive: boolean;
      currentUses: number;
      maxUses: number | null;
      maxPerUser: number;
      validFrom: Date;
      validUntil: Date | null;
      description: string | null;
      planId: string | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const where: Record<string, unknown> = {};

    if (options.active !== undefined) {
      where.isActive = options.active;
    }

    if (options.type) {
      where.type = options.type;
    }

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const [vouchers, total] = await Promise.all([
      db.voucher.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      db.voucher.count({ where }),
    ]);

    return {
      vouchers: vouchers.map((v) => ({
        ...v,
        value: Number(v.value),
      })),
      total,
    };
  }

  /**
   * Update voucher
   */
  async update(
    voucherId: string,
    data: Partial<{
      isActive: boolean;
      maxUses: number;
      validUntil: Date;
      description: string;
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await db.voucher.update({
        where: { id: voucherId },
        data,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd aktualizacji',
      };
    }
  }

  /**
   * Delete voucher
   */
  async delete(voucherId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if voucher has usages
      const usages = await db.voucherUsage.count({
        where: { voucherId },
      });

      if (usages > 0) {
        // Soft delete - deactivate instead
        await db.voucher.update({
          where: { id: voucherId },
          data: { isActive: false },
        });
      } else {
        // Hard delete
        await db.voucher.delete({
          where: { id: voucherId },
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd usuwania',
      };
    }
  }

  /**
   * Generate random voucher code
   */
  generateCode(prefix: string = 'ZONE'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix.toUpperCase() + '-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Bulk create vouchers
   */
  async createBulk(params: {
    count: number;
    prefix?: string;
    type: VoucherType;
    value: number;
    maxUses?: number;
    maxPerUser?: number;
    validUntil?: Date;
    planId?: string;
    description?: string;
    createdBy?: string;
  }): Promise<{ success: boolean; codes: string[]; error?: string }> {
    try {
      const codes: string[] = [];
      const vouchersToCreate = [];

      for (let i = 0; i < params.count; i++) {
        let code = this.generateCode(params.prefix);
        let attempts = 0;

        // Ensure unique code
        while (await db.voucher.findUnique({ where: { code } })) {
          code = this.generateCode(params.prefix);
          attempts++;
          if (attempts > 100) {
            throw new Error('Nie udało się wygenerować unikalnego kodu');
          }
        }

        codes.push(code);
        vouchersToCreate.push({
          code,
          type: params.type,
          value: params.value,
          maxUses: params.maxUses,
          maxPerUser: params.maxPerUser || 1,
          validFrom: new Date(),
          validUntil: params.validUntil,
          planId: params.planId,
          description: params.description,
          createdBy: params.createdBy,
          isActive: true,
        });
      }

      // Bulk insert
      await db.voucher.createMany({
        data: vouchersToCreate,
      });

      return { success: true, codes };
    } catch (error) {
      console.error('Bulk create voucher error:', error);
      return {
        success: false,
        codes: [],
        error: error instanceof Error ? error.message : 'Błąd masowego tworzenia',
      };
    }
  }

  /**
   * Get voucher statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    totalUsages: number;
    totalDiscount: number;
    byType: Record<string, number>;
  }> {
    const [total, active, usages] = await Promise.all([
      db.voucher.count(),
      db.voucher.count({ where: { isActive: true } }),
      db.voucherUsage.findMany({
        select: { discountAmount: true },
      }),
    ]);

    const totalDiscount = usages.reduce((sum, u) => sum + Number(u.discountAmount), 0);

    const byTypeRaw = await db.voucher.groupBy({
      by: ['type'],
      _count: true,
    });

    const byType: Record<string, number> = {};
    byTypeRaw.forEach((item) => {
      byType[item.type] = item._count;
    });

    return {
      total,
      active,
      totalUsages: usages.length,
      totalDiscount,
      byType,
    };
  }

  /**
   * Get user's voucher usage history
   */
  async getUserUsages(userId: string): Promise<Array<{
    id: string;
    code: string;
    discountAmount: number;
    usedAt: Date;
  }>> {
    const usages = await db.voucherUsage.findMany({
      where: { userId },
      include: { voucher: { select: { code: true } } },
      orderBy: { usedAt: 'desc' },
    });

    return usages.map((u) => ({
      id: u.id,
      code: u.voucher.code,
      discountAmount: Number(u.discountAmount),
      usedAt: u.usedAt,
    }));
  }
}

// Export singleton instance
export const voucherService = new VoucherService();
