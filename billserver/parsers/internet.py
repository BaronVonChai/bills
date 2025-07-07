from .base import BaseBillParser
import re

class InternetBillParser(BaseBillParser):

    def extract_amount(self):
        """
        Extract the pound amount from the internet bill.
        """
        pattern = r'Amount due\s+£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'

        match = re.search(pattern, self.extracted_text)

        if match:
            amount_str = match.group(1)
            return float(amount_str.replace(',', ''))

        return None