import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def download_vcard():
    """Generate and return a vCard (.vcf) file from Chat Settings.

    Works on all phones — iOS, Android, feature phones.
    """
    settings = frappe.get_cached_doc("Chat Settings")

    brand_name = settings.brand_name or "Contact"
    phone = settings.phone_number or ""
    email = settings.company_email or ""
    address = (settings.company_address or "").replace("\n", "\\n")
    whatsapp = settings.whatsapp_number or ""
    telegram = settings.telegram_link or ""
    website = ""

    # Try to get website URL from Website Settings
    try:
        ws = frappe.db.get_value("Website Settings", None, "home_page")
        site_name = frappe.utils.get_url()
        website = site_name
    except Exception:
        pass

    # Build vCard 3.0 (most compatible format)
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{brand_name}",
        f"ORG:{brand_name}",
    ]

    if phone:
        lines.append(f"TEL;TYPE=WORK,VOICE:{phone}")

    if whatsapp and whatsapp != phone:
        lines.append(f"TEL;TYPE=CELL:{whatsapp}")

    if email:
        lines.append(f"EMAIL;TYPE=WORK:{email}")

    if website:
        lines.append(f"URL:{website}")

    if address:
        lines.append(f"ADR;TYPE=WORK:;;{address};;;;")

    if telegram:
        lines.append(f"X-SOCIALPROFILE;TYPE=telegram:{telegram}")

    # Social links
    if settings.instagram_url:
        lines.append(f"X-SOCIALPROFILE;TYPE=instagram:{settings.instagram_url}")
    if settings.facebook_url:
        lines.append(f"X-SOCIALPROFILE;TYPE=facebook:{settings.facebook_url}")
    if settings.tiktok_url:
        lines.append(f"X-SOCIALPROFILE;TYPE=tiktok:{settings.tiktok_url}")

    # Add logo if available
    if settings.brand_logo:
        try:
            import base64
            logo_path = frappe.get_site_path("public", settings.brand_logo.lstrip("/"))
            with open(logo_path, "rb") as f:
                logo_data = base64.b64encode(f.read()).decode()
            lines.append(f"PHOTO;ENCODING=b;TYPE=PNG:{logo_data}")
        except Exception:
            pass

    lines.append("END:VCARD")

    vcf_content = "\r\n".join(lines)
    filename = f"{brand_name.replace(' ', '_')}.vcf"

    frappe.response["filename"] = filename
    frappe.response["filecontent"] = vcf_content
    frappe.response["content_type"] = "text/vcard"
    frappe.response["type"] = "download"
