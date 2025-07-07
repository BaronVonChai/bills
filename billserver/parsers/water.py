from .base import BaseBillParser
import re

class WaterBillParser(BaseBillParser):

    def extract_amount(self):
        """
        Extract the pound amount from the water bill.
        """
        # Look for the pattern: "taken on" followed by date, then the amount
        pattern = r'taken on\s+\d{1,2}\s+\w+\s+\d{2}\s+£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'

        match = re.search(pattern, self.extracted_text)

        if match:
            amount_str = match.group(1)
            return float(amount_str.replace(',', ''))

        return None