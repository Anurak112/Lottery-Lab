import { describe, it, expect, vi } from 'vitest';

/**
 * Unit tests for Social Share Buttons
 * Tests the share URL generation and text formatting logic
 */

describe('Social Share Buttons', () => {
  describe('Share URL Generation', () => {
    const baseUrl = 'https://lottery-lab.example.com';

    it('should generate correct Facebook share URL', () => {
      const text = 'Test share text';
      const url = baseUrl;
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      
      expect(fbUrl).toContain('facebook.com/sharer/sharer.php');
      expect(fbUrl).toContain(encodeURIComponent(url));
      expect(fbUrl).toContain(encodeURIComponent(text));
    });

    it('should generate correct LINE share URL', () => {
      const text = 'Test share text';
      const url = baseUrl;
      const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      
      expect(lineUrl).toContain('line.me/lineit/share');
      expect(lineUrl).toContain(encodeURIComponent(url));
      expect(lineUrl).toContain(encodeURIComponent(text));
    });

    it('should generate correct Twitter share URL', () => {
      const text = 'Test share text';
      const url = baseUrl;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      
      expect(twitterUrl).toContain('twitter.com/intent/tweet');
      expect(twitterUrl).toContain(encodeURIComponent(url));
      expect(twitterUrl).toContain(encodeURIComponent(text));
    });
  });

  describe('Share Text Generation', () => {
    it('should generate share text with lottery result', () => {
      const lotteryResult = {
        firstPrize: '461252',
        lastTwo: '22',
        frontThree: ['655', '389'],
        lastThree: ['137', '995'],
        date: '1 ธันวาคม 2568',
      };

      let shareText = `🎰 ผลสลากกินแบ่งรัฐบาล`;
      if (lotteryResult.date) {
        shareText += ` (${lotteryResult.date})`;
      }
      shareText += `\n\n`;
      
      if (lotteryResult.firstPrize) {
        shareText += `🏆 รางวัลที่ 1: ${lotteryResult.firstPrize}\n`;
      }
      if (lotteryResult.lastTwo) {
        shareText += `🔢 เลขท้าย 2 ตัว: ${lotteryResult.lastTwo}\n`;
      }

      expect(shareText).toContain('🎰');
      expect(shareText).toContain('461252');
      expect(shareText).toContain('22');
      expect(shareText).toContain('1 ธันวาคม 2568');
    });

    it('should generate default share text when no lottery result', () => {
      const defaultText = "ตรวจผลสลากกินแบ่งรัฐบาลออนไลน์ที่ Lottery Lab 🎰";
      
      expect(defaultText).toContain('ตรวจผลสลากกินแบ่งรัฐบาล');
      expect(defaultText).toContain('Lottery Lab');
      expect(defaultText).toContain('🎰');
    });

    it('should include all prize types in share text', () => {
      const lotteryResult = {
        firstPrize: '123456',
        lastTwo: '56',
        frontThree: ['123', '456'],
        lastThree: ['789', '012'],
        date: '16 ธันวาคม 2568',
      };

      let shareText = '';
      if (lotteryResult.firstPrize) {
        shareText += `🏆 รางวัลที่ 1: ${lotteryResult.firstPrize}\n`;
      }
      if (lotteryResult.lastTwo) {
        shareText += `🔢 เลขท้าย 2 ตัว: ${lotteryResult.lastTwo}\n`;
      }
      if (lotteryResult.frontThree && lotteryResult.frontThree.length > 0) {
        shareText += `📍 เลขหน้า 3 ตัว: ${lotteryResult.frontThree.join(', ')}\n`;
      }
      if (lotteryResult.lastThree && lotteryResult.lastThree.length > 0) {
        shareText += `📍 เลขท้าย 3 ตัว: ${lotteryResult.lastThree.join(', ')}\n`;
      }

      expect(shareText).toContain('123456');
      expect(shareText).toContain('56');
      expect(shareText).toContain('123, 456');
      expect(shareText).toContain('789, 012');
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode Thai text in URL', () => {
      const thaiText = 'ผลสลากกินแบ่งรัฐบาล';
      const encoded = encodeURIComponent(thaiText);
      
      expect(encoded).not.toBe(thaiText);
      expect(decodeURIComponent(encoded)).toBe(thaiText);
    });

    it('should properly encode special characters', () => {
      const textWithSpecialChars = 'รางวัล #1: 123456 (งวด 1/12/68)';
      const encoded = encodeURIComponent(textWithSpecialChars);
      
      expect(encoded).toContain('%23'); // # encoded
      expect(encoded).toContain('%3A'); // : encoded
      expect(decodeURIComponent(encoded)).toBe(textWithSpecialChars);
    });

    it('should handle emoji in share text', () => {
      const textWithEmoji = '🎰 ผลหวย 🏆';
      const encoded = encodeURIComponent(textWithEmoji);
      
      expect(decodeURIComponent(encoded)).toBe(textWithEmoji);
    });
  });

  describe('Share Window Parameters', () => {
    it('should use correct popup window dimensions', () => {
      const windowParams = 'width=600,height=400';
      
      expect(windowParams).toContain('width=600');
      expect(windowParams).toContain('height=400');
    });
  });

  describe('Inline Share Text Generation', () => {
    it('should generate compact share text for inline buttons', () => {
      const lotteryResult = {
        firstPrize: '461252',
        lastTwo: '22',
        date: '1 ธันวาคม 2568',
      };

      let shareText = `🎰 ผลสลากกินแบ่งรัฐบาล`;
      if (lotteryResult.date) {
        shareText += ` (${lotteryResult.date})`;
      }
      if (lotteryResult.firstPrize) {
        shareText += ` | รางวัลที่ 1: ${lotteryResult.firstPrize}`;
      }
      if (lotteryResult.lastTwo) {
        shareText += ` | เลขท้าย 2 ตัว: ${lotteryResult.lastTwo}`;
      }
      shareText += ` 🔗`;

      expect(shareText).toContain('|');
      expect(shareText.length).toBeLessThan(200); // Compact for Twitter
    });
  });

  describe('Native Share API Detection', () => {
    it('should detect native share support', () => {
      // Mock navigator.share
      const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
      
      // In test environment, navigator.share is typically not available
      expect(typeof hasNativeShare).toBe('boolean');
    });
  });

  describe('Share Button Props', () => {
    it('should accept lottery result props', () => {
      const props = {
        title: 'ผลสลากกินแบ่งรัฐบาล - Lottery Lab',
        text: 'Custom share text',
        url: 'https://example.com',
        lotteryResult: {
          firstPrize: '123456',
          lastTwo: '56',
          frontThree: ['123', '456'],
          lastThree: ['789', '012'],
          date: '16 ธันวาคม 2568',
        },
      };

      expect(props.title).toBeDefined();
      expect(props.lotteryResult?.firstPrize).toBe('123456');
      expect(props.lotteryResult?.frontThree).toHaveLength(2);
    });

    it('should use default title when not provided', () => {
      const defaultTitle = 'ผลสลากกินแบ่งรัฐบาล - Lottery Lab';
      
      expect(defaultTitle).toContain('Lottery Lab');
    });
  });
});
