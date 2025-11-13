import pytest
from pathlib import Path
import json
from datetime import datetime

# ---------------------------------------------------------------------------
# Helpers for file operations
# ---------------------------------------------------------------------------

def _find_case_insensitive(target_path: str) -> Path | None:
    """
    Find a file or directory in a case-insensitive manner.
    Returns the actual Path if found, None otherwise.
    """
    p = Path(target_path)
    parent = p.parent if p.parent != Path('.') else Path('.')
    name_lower = p.name.lower()
    
    # If parent doesn't exist, can't search
    if not parent.exists():
        return None
    
    # Search in parent directory for case-insensitive match
    for item in parent.iterdir():
        if item.name.lower() == name_lower:
            return item
    
    return None


# ============================================================================
# SMOKE TESTS - File and Directory Existence
# ============================================================================

def test_index_html_exists():
    filename = "index.html"
    found = _find_case_insensitive(filename)
    if not found:
        pytest.fail(f"❌ {filename} is missing")
    else:
        print(f"✅ {filename} is present (found as: {found.name})")
        assert True

def test_style_css_exists():
    filename = "css/style.css"
    found = _find_case_insensitive(filename)
    if not found:
        pytest.fail(f"❌ {filename} is missing")
    else:
        print(f"✅ {filename} is present (found as: {found})")
        assert True

def test_scripts_js_exists():
    filename = "js/scripts.js"
    found = _find_case_insensitive(filename)
    if not found:
        pytest.fail(f"❌ {filename} is missing")
    else:
        print(f"✅ {filename} is present (found as: {found})")
        assert True

def test_documentation_pdf_exists():
    filename = "Documentation.pdf"
    found = _find_case_insensitive(filename)
    if not found:
        pytest.fail(f"❌ {filename} is missing")
    else:
        print(f"✅ {filename} is present (found as: {found.name})")
        assert True

def test_images_dir_exists():
    dirname = "imgs"
    options = [dirname, "img"]
    found = None
    for d in options:
        candidate = _find_case_insensitive(d)
        if candidate and candidate.is_dir():
            found = candidate
            break
    if not found:
        pytest.fail(f"❌ {dirname}/ directory is missing (expected 'imgs/' or 'img/')")
    else:
        print(f"✅ {dirname}/ directory is present (found as: {found.name}/)")
        assert True
